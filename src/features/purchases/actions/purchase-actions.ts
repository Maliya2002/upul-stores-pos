"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  purchaseSchema,
  type PurchaseFormValues,
} from "../schemas/purchase-schema";

function generatePurchaseNumber(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PO-${y}${m}-${rand}`;
}

export async function getPurchases() {
  return prisma.purchase.findMany({
    include: {
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseById(id: string) {
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
  const validated = purchaseSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitCost * item.quantity,
      0
    );

    const purchase = await prisma.$transaction(async (tx) => {
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
              name: item.name,
              quantity: item.quantity,
              unitCost: item.unitCost,
              total: item.unitCost * item.quantity,
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
    });

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    return {
      success: true,
      message: `Purchase ${purchase.purchaseNumber} created.`,
      purchaseId: purchase.id,
    };
  } catch {
    return { success: false, error: "Failed to create purchase." };
  }
}