"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { serializable } from "@/lib/transaction";
import {
  RequestConflict,
  fingerprint,
  validateRequestKey,
  verifyReplay,
} from "@/lib/idempotency";
import { randomUUID } from "node:crypto";
import { money, CheckoutError } from "@/features/pos/utils/checkout";
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
      payments: { orderBy: [{ paidAt: "desc" }, { id: "desc" }] },
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
  const staff = await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const validated = purchaseSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      retryable: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;

  try {
    validateRequestKey(data.requestKey);
    const requestHash = fingerprint({
      ...(data.paidAmount !== undefined ? { paidAmount: data.paidAmount } : {}),
      staff: staff.id,
      supplier: data.supplierId,
      payment: data.paymentMethod,
      notes: data.notes.trim(),
      items: data.items
        .map(({ productId, quantity, unitCost }) => ({
          productId,
          quantity,
          unitCost,
        }))
        .sort((a, b) => a.productId.localeCompare(b.productId)),
    });
    const subtotal = money(
      data.items.reduce(
        (sum, item) => sum + money(item.unitCost * item.quantity),
        0,
      ),
    );

    if (
      !Number.isSafeInteger(Math.round(subtotal * 100)) ||
      subtotal > 100000000
    )
      throw new CheckoutError(
        "Purchase total must not exceed Rs. 100,000,000.",
      );

    const paid = data.paidAmount ?? subtotal;
    if (paid > subtotal)
      throw new CheckoutError("Payment exceeds the purchase total.");
    const due = money(subtotal - paid);
    const purchase = await serializable(async (tx) => {
      const replay = await tx.purchase.findUnique({
        where: { requestKey: data.requestKey },
      });
      if (replay) {
        verifyReplay(replay.requestHash, requestHash);
        return replay;
      }
      const supplier = await tx.supplier.findFirst({
        where: { id: data.supplierId, isActive: true },
      });
      if (!supplier) throw new CheckoutError("Supplier is unavailable.");
      const products = await tx.product.findMany({
        where: {
          id: { in: data.items.map((item) => item.productId) },
          isActive: true,
        },
      });
      if (products.length !== data.items.length)
        throw new CheckoutError(
          "Products must be active and must not appear twice.",
        );
      const newPurchase = await tx.purchase.create({
        data: {
          requestKey: data.requestKey,
          requestHash,
          purchaseNumber: generatePurchaseNumber(),
          supplierId: data.supplierId,
          subtotal,
          total: subtotal,
          paidAmount: paid,
          status: "RECEIVED",
          paymentMethod: data.paymentMethod,
          paymentStatus:
            due === 0 ? "PAID" : paid === 0 ? "PENDING" : "PARTIAL",
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
          if (product.quantity + item.quantity > 2147483647)
            throw new CheckoutError("Stock exceeds the supported quantity.");
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
        data: { totalOrders: { increment: 1 }, balance: { increment: due } },
      });

      if (paid > 0)
        await tx.supplierPayment.create({
          data: {
            supplierId: data.supplierId,
            purchaseId: newPurchase.id,
            amount: paid,
            method: data.paymentMethod,
            notes: "Payment at receiving",
          },
        });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "PURCHASE_RECEIVED",
          entity: "Purchase",
          entityId: newPurchase.id,
          newValues: JSON.stringify({
            purchaseNumber: newPurchase.purchaseNumber,
            total: subtotal,
            paidAmount: paid,
            outstanding: due,
            supplierId: data.supplierId,
          }),
        },
      });
      return newPurchase;
    });

    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${data.supplierId}`);
    revalidatePath("/purchases");
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/pos");
    return {
      success: true,
      message: `Purchase ${purchase.purchaseNumber} created.`,
      purchaseId: purchase.id,
    };
  } catch (error) {
    return {
      success: false,
      retryable:
        error instanceof RequestConflict || !(error instanceof CheckoutError),
      error:
        error instanceof CheckoutError
          ? error.message
          : "Purchase outcome could not be confirmed. Retry the same request.",
    };
  }
}
