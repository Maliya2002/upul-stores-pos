"use server";

import prisma from "@/lib/prisma";
import type { ProductData, CustomerData } from "../utils/ai-algorithms";

export async function getAIProductData(): Promise<ProductData[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true } },
      orderItems: { select: { quantity: true } },
    },
  });

  const now = new Date();

  return products.map((p) => {
    const totalSold = p.orderItems.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      minimumStock: p.minimumStock,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      totalSold,
      totalRevenue: totalSold * p.sellingPrice,
      lastSoldDays: Math.floor(
        (now.getTime() - p.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
      category: p.category.name,
    };
  });
}

export async function getAICustomerData(): Promise<CustomerData[]> {
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    include: {
      orders: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const now = new Date();

  return customers.map((c) => {
    const lastOrder = c.orders[0]?.createdAt;
    const lastOrderDays = lastOrder
      ? Math.floor(
          (now.getTime() - lastOrder.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    return {
      id: c.id,
      name: c.name,
      totalOrders: c.totalOrders,
      totalSpent: c.totalPurchases,
      loyaltyPoints: c.loyaltyPoints,
      membershipLevel: c.membershipLevel,
      lastOrderDays,
    };
  });
}

export async function getAIMonthlySales() {
  const months: { revenue: number; orders: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const sales = await prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: start, lte: end },
        orderStatus: "COMPLETED",
      },
    });

    months.push({
      revenue: sales._sum.total ?? 0,
      orders: sales._count,
    });
  }

  return months;
}