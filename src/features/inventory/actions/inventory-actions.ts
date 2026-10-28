"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
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

export async function stockInAction(input: StockMovementValues) {
  const staff = await requireStaff([
    "OWNER",
    "ADMIN",
    "MANAGER",
    "INVENTORY_STAFF",
  ]);
  const validated = stockMovementSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;
  if (!data.notes.trim())
    return { success: false, error: "A reason is required." };

  if (data.type !== "ADJUSTMENT")
    return {
      success: false,
      error: "Use the purchase or return workflow to receive those goods.",
    };
  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isActive)
      return { success: false, error: "Product not found." };

    if (product.quantity + data.quantity > 2147483647)
      return { success: false, error: "Stock exceeds the supported quantity." };
    await prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: { id: data.productId, quantity: product.quantity },
        data: { quantity: { increment: data.quantity } },
      });
      if (updated.count !== 1) throw new Error("Stock changed. Try again.");

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          beforeQty: product.quantity,
          afterQty: product.quantity + data.quantity,
          reference: data.reference?.trim() || null,
          notes: data.notes?.trim() || null,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "STOCK_ADJUSTED",
          entity: "StockMovement",
          entityId: movement.id,
          oldValues: JSON.stringify({ quantity: movement.beforeQty }),
          newValues: JSON.stringify({
            productId: movement.productId,
            quantity: movement.afterQty,
            reason: movement.notes,
          }),
        },
      });
    });

    revalidatePath("/pos");
    revalidatePath("/inventory");
    revalidatePath("/products");
    return {
      success: true,
      message: `${data.quantity} units added to ${product.name}.`,
    };
  } catch {
    return {
      success: false,
      error:
        "Stock update unconfirmed. Check movement history before submitting again.",
    };
  }
}

/* ── Stock Out ───────────────────────────── */

export async function stockOutAction(input: StockMovementValues) {
  const staff = await requireStaff([
    "OWNER",
    "ADMIN",
    "MANAGER",
    "INVENTORY_STAFF",
  ]);
  const validated = stockMovementSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;
  if (!data.notes.trim())
    return { success: false, error: "A reason is required." };

  if (!["ADJUSTMENT", "DAMAGED", "EXPIRED"].includes(data.type))
    return {
      success: false,
      error: "Use the sales workflow for sales and customer returns.",
    };
  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isActive)
      return { success: false, error: "Product not found." };

    if (product.quantity < data.quantity) {
      return {
        success: false,
        error: `Not enough stock. Available: ${product.quantity}`,
      };
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: { id: data.productId, quantity: product.quantity },
        data: { quantity: { decrement: data.quantity } },
      });
      if (updated.count !== 1) throw new Error("Stock changed. Try again.");

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          beforeQty: product.quantity,
          afterQty: product.quantity - data.quantity,
          reference: data.reference?.trim() || null,
          notes: data.notes?.trim() || null,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "STOCK_ADJUSTED",
          entity: "StockMovement",
          entityId: movement.id,
          oldValues: JSON.stringify({ quantity: movement.beforeQty }),
          newValues: JSON.stringify({
            productId: movement.productId,
            quantity: movement.afterQty,
            reason: movement.notes,
          }),
        },
      });
    });

    revalidatePath("/pos");
    revalidatePath("/inventory");
    revalidatePath("/products");
    return {
      success: true,
      message: `${data.quantity} units removed from ${product.name}.`,
    };
  } catch {
    return {
      success: false,
      error:
        "Stock update unconfirmed. Check movement history before submitting again.",
    };
  }
}

/* ── Stock Adjustment ────────────────────── */

export async function stockAdjustAction(
  productId: string,
  newQuantity: number,
  notes?: string,
  expectedQuantity?: number,
) {
  const staff = await requireStaff([
    "OWNER",
    "ADMIN",
    "MANAGER",
    "INVENTORY_STAFF",
  ]);
  if (
    !Number.isSafeInteger(newQuantity) ||
    newQuantity < 0 ||
    newQuantity > 2147483647 ||
    !Number.isSafeInteger(expectedQuantity) ||
    expectedQuantity! < 0 ||
    typeof notes !== "string" ||
    !notes.trim() ||
    notes.length > 2000
  ) {
    return {
      success: false,
      error: "Stock must be a non-negative whole number.",
    };
  }
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive)
      return { success: false, error: "Product not found." };

    if (product.quantity !== expectedQuantity)
      return {
        success: false,
        error: "Stock changed. Refresh and recount before adjusting.",
      };
    if (product.quantity === newQuantity)
      return { success: true, message: "Stock count unchanged." };
    await prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: { id: productId, quantity: product.quantity },
        data: { quantity: newQuantity },
      });
      if (updated.count !== 1) throw new Error("Stock changed. Try again.");

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type: "ADJUSTMENT",
          quantity: Math.abs(newQuantity - product.quantity),
          beforeQty: product.quantity,
          afterQty: newQuantity,
          reference: "MANUAL_ADJUSTMENT",
          notes: notes?.trim() || "Manual stock adjustment",
        },
      });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "STOCK_ADJUSTED",
          entity: "StockMovement",
          entityId: movement.id,
          oldValues: JSON.stringify({ quantity: movement.beforeQty }),
          newValues: JSON.stringify({
            productId: movement.productId,
            quantity: movement.afterQty,
            reason: movement.notes,
          }),
        },
      });
    });

    revalidatePath("/pos");
    revalidatePath("/inventory");
    revalidatePath("/products");
    return {
      success: true,
      message: `${product.name} adjusted to ${newQuantity} units.`,
    };
  } catch {
    return { success: false, error: "Failed to adjust stock." };
  }
}
