"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { serializable } from "@/lib/transaction";
import {
  fingerprint,
  validateRequestKey,
  verifyReplay,
  RequestConflict,
} from "@/lib/idempotency";
import { CheckoutError } from "@/features/pos/utils/checkout";
import {
  stockMovementSchema,
  type StockMovementValues,
} from "../schemas/inventory-schema";

/* ── Dashboard Stats ─────────────────────── */

export async function getInventoryStats() {
  await requireStaff();
  const [
    totalProducts,
    totalStock,
    lowStockItems,
    outOfStockItems,
    recentMovements,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.aggregate({
      _sum: { quantity: true },
      where: { isActive: true },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        quantity: { gt: 0 },
        AND: {
          quantity: { lte: prisma.product.fields.minimumStock },
        },
      },
    }),
    prisma.product.count({
      where: { isActive: true, quantity: 0 },
    }),
    prisma.stockMovement.count(),
  ]);

  // Manual low stock count
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { quantity: true, minimumStock: true },
  });

  const lowCount = allProducts.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minimumStock,
  ).length;

  const outCount = allProducts.filter((p) => p.quantity === 0).length;

  return {
    totalProducts,
    totalStock: totalStock._sum.quantity ?? 0,
    lowStockItems: lowCount,
    outOfStockItems: outCount,
    totalMovements: recentMovements,
  };
}

/* ── Products for Select ─────────────────── */

export async function getProductsForSelect() {
  await requireStaff();
  return prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      minimumStock: true,
    },
    orderBy: { name: "asc" },
  });
}

/* ── Stock Movements ─────────────────────── */

export async function getStockMovements(options?: {
  type?: string;
  limit?: number;
}) {
  await requireStaff();
  return prisma.stockMovement.findMany({
    where: options?.type
      ? {
          type: options.type as
            | "PURCHASE"
            | "SALE"
            | "ADJUSTMENT"
            | "TRANSFER"
            | "DAMAGED"
            | "EXPIRED"
            | "RETURN",
        }
      : undefined,
    include: {
      product: {
        select: { name: true, sku: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 100,
  });
}

/* ── Low Stock Products ──────────────────── */

export async function getLowStockProducts() {
  await requireStaff();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
    orderBy: { quantity: "asc" },
  });

  return products.filter((p) => p.quantity <= p.minimumStock);
}

/* ── Expired Products ────────────────────── */

export async function getExpiredProducts() {
  await requireStaff();
  return prisma.product.findMany({
    where: {
      isActive: true,
      expiryDate: { lte: new Date() },
    },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { expiryDate: "asc" },
  });
}

/* ── Stock In ────────────────────────────── */

async function mutateStock(
  input: StockMovementValues,
  mode: "in" | "out" | "count",
  requestKey: string,
  expectedQuantity?: number,
) {
  const staff = await requireStaff([
    "OWNER",
    "ADMIN",
    "MANAGER",
    "INVENTORY_STAFF",
  ]);
  try {
    validateRequestKey(requestKey);
    // Counts may legitimately be zero; movement quantities must be positive.
    const parsed = stockMovementSchema.safeParse(
      mode === "count" ? { ...input, quantity: 1 } : input,
    );
    if (!parsed.success)
      throw new CheckoutError(
        parsed.error.issues[0]?.message ?? "Invalid adjustment.",
      );
    const data = {
      ...parsed.data,
      quantity: mode === "count" ? input.quantity : parsed.data.quantity,
    };
    if (
      mode === "count" &&
      (!Number.isSafeInteger(data.quantity) ||
        data.quantity < 0 ||
        data.quantity > 2147483647 ||
        !Number.isSafeInteger(expectedQuantity) ||
        expectedQuantity! < 0 ||
        expectedQuantity! > 2147483647)
    )
      throw new CheckoutError(
        "Provide valid counts and refresh before counting.",
      );
    if (
      !(
        mode === "out" ? ["ADJUSTMENT", "DAMAGED", "EXPIRED"] : ["ADJUSTMENT"]
      ).includes(data.type)
    )
      throw new CheckoutError(
        "Use the purchase or sales workflow for purchases, sales and returns.",
      );
    const hash = fingerprint({
      staff: staff.id,
      mode,
      ...data,
      reference: data.reference.trim(),
      expectedQuantity,
    });
    const result = await serializable(async (tx) => {
      const replay = await tx.stockMovement.findUnique({
        where: { requestKey },
      });
      if (replay) {
        verifyReplay(replay.requestHash, hash);
        return replay;
      }
      const product = await tx.product.findFirst({
        where: { id: data.productId, isActive: true },
      });
      if (!product) throw new CheckoutError("Product is unavailable.");
      if (mode === "count" && product.quantity !== expectedQuantity)
        throw new CheckoutError(
          "Stock changed. Refresh and recount before adjusting.",
        );
      const afterQty =
        mode === "count"
          ? data.quantity
          : product.quantity + (mode === "in" ? data.quantity : -data.quantity);
      if (afterQty < 0 || afterQty > 2147483647)
        throw new CheckoutError(
          "Resulting stock is outside the supported range.",
        );
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: afterQty },
      });
      const movement = await tx.stockMovement.create({
        data: {
          requestKey,
          requestHash: hash,
          productId: product.id,
          type: data.type,
          quantity: Math.abs(afterQty - product.quantity),
          beforeQty: product.quantity,
          afterQty,
          notes: data.notes,
          reference: data.reference.trim() || null,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "STOCK_ADJUSTED",
          entity: "StockMovement",
          entityId: movement.id,
          oldValues: JSON.stringify({ quantity: product.quantity }),
          newValues: JSON.stringify({
            productId: product.id,
            quantity: afterQty,
            reason: data.notes,
            mode,
          }),
        },
      });
      return movement;
    });
    for (const path of ["/inventory", "/products", "/pos"])
      revalidatePath(path);
    return {
      success: true,
      retryable: false,
      movementId: result.id,
      message: "Stock adjustment recorded.",
    };
  } catch (error) {
    return {
      success: false,
      retryable:
        error instanceof RequestConflict || !(error instanceof CheckoutError),
      error:
        error instanceof CheckoutError
          ? error.message
          : "Outcome unconfirmed. Retry the same request.",
    };
  }
}

export async function stockInAction(
  input: StockMovementValues,
  requestKey = "",
) {
  return mutateStock(input, "in", requestKey);
}
export async function stockOutAction(
  input: StockMovementValues,
  requestKey = "",
) {
  return mutateStock(input, "out", requestKey);
}
export async function stockAdjustAction(
  productId: string,
  newQuantity: number,
  notes?: string,
  expectedQuantity?: number,
  requestKey = "",
) {
  return mutateStock(
    {
      productId,
      quantity: newQuantity,
      notes: notes ?? "",
      reference: "MANUAL_COUNT",
      type: "ADJUSTMENT",
    },
    "count",
    requestKey,
    expectedQuantity,
  );
}
