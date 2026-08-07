"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  stockMovementSchema,
  type StockMovementValues,
} from "../schemas/inventory-schema";

/* ── Dashboard Stats ─────────────────────── */

export async function getInventoryStats() {
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
    (p) => p.quantity > 0 && p.quantity <= p.minimumStock
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
  const validated = stockMovementSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) return { success: false, error: "Product not found." };

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: data.productId },
        data: { quantity: { increment: data.quantity } },
      });

      await tx.stockMovement.create({
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
    });

    revalidatePath("/inventory");
    revalidatePath("/products");
    return {
      success: true,
      message: `${data.quantity} units added to ${product.name}.`,
    };
  } catch {
    return { success: false, error: "Failed to update stock." };
  }
}

/* ── Stock Out ───────────────────────────── */

export async function stockOutAction(input: StockMovementValues) {
  const validated = stockMovementSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const data = validated.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) return { success: false, error: "Product not found." };

    if (product.quantity < data.quantity) {
      return {
        success: false,
        error: `Not enough stock. Available: ${product.quantity}`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: data.productId },
        data: { quantity: { decrement: data.quantity } },
      });

      await tx.stockMovement.create({
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
    });

    revalidatePath("/inventory");
    revalidatePath("/products");
    return {
      success: true,
      message: `${data.quantity} units removed from ${product.name}.`,
    };
  } catch {
    return { success: false, error: "Failed to update stock." };
  }
}

/* ── Stock Adjustment ────────────────────── */

export async function stockAdjustAction(
  productId: string,
  newQuantity: number,
  notes?: string
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return { success: false, error: "Product not found." };

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      });

      await tx.stockMovement.create({
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
    });

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