"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { money } from "@/features/pos/utils/checkout";
import {
  purchaseSchema,
  type PurchaseFormValues,
} from "../schemas/purchase-schema";

function generatePurchaseNumber(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const rand = randomUUID().slice(0, 8).toUpperCase();
  return `PO-${y}${m}-${rand}`;
}

export async function getPurchases() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  return prisma.purchase.findMany({
    include: {
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseById(id: string) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: { product: { select: { name: true, sku: true } } },
      },
    },
  });
}

export async function getPurchaseFormData() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, purchasePrice: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { suppliers, products };
}

export async function createPurchaseAction(input: PurchaseFormValues) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const validated = purchaseSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;

  try {
    const subtotal = money(
      data.items.reduce(
        (sum, item) => sum + money(item.unitCost * item.quantity),
        0,
      ),
    );

    const purchase = await prisma.$transaction(
      async (tx) => {
        const supplier = await tx.supplier.findFirst({
          where: { id: data.supplierId, isActive: true },
        });
        if (!supplier) throw new Error("Supplier is unavailable.");
        const products = await tx.product.findMany({
          where: {
            id: { in: data.items.map((item) => item.productId) },
            isActive: true,
          },
        });
        if (products.length !== data.items.length)
          throw new Error("Products must be active and must not appear twice.");
        const newPurchase = await tx.purchase.create({
          data: {
            purchaseNumber: generatePurchaseNumber(),
            supplierId: data.supplierId,
            subtotal,
            total: subtotal,
            paidAmount: subtotal,
            status: "RECEIVED",
            paymentMethod: data.paymentMethod,
            paymentStatus: "PAID",
            notes: data.notes?.trim() || null,
            items: {
              create: data.items.map((item) => ({
                productId: item.productId,
                name: products.find((product) => product.id === item.productId)!
                  .name,
                quantity: item.quantity,
                unitCost: item.unitCost,
                total: money(item.unitCost * item.quantity),
              })),
            },
          },
        });

        // Update stock
        for (const item of data.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { quantity: { increment: item.quantity } },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                type: "PURCHASE",
                quantity: item.quantity,
                beforeQty: product.quantity,
                afterQty: product.quantity + item.quantity,
                reference: newPurchase.purchaseNumber,
                notes: `Purchase from ${data.supplierId}`,
              },
            });
          }
        }

        // Update supplier
        await tx.supplier.update({
          where: { id: data.supplierId },
          data: { totalOrders: { increment: 1 } },
        });

        return newPurchase;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/pos");
    return {
      success: true,
      message: `Purchase ${purchase.purchaseNumber} created.`,
      purchaseId: purchase.id,
    };
  } catch {
    return { success: false, error: "Failed to create purchase." };
  }
}
