"use server";

import prisma from "@/lib/prisma";

export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const monthStart = new Date(today);
  monthStart.setDate(1);

  const [
    todaySales,
    weekSales,
    monthSales,
    totalProducts,
    totalCustomers,
    recentOrders,
    topProducts,
    lowStockProducts,
    monthlySalesData,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: today }, orderStatus: "COMPLETED" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: weekStart }, orderStatus: "COMPLETED" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: monthStart }, orderStatus: "COMPLETED" },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        minimumStock: true,
      },
      orderBy: { quantity: "asc" },
      take: 20,
    }),
    getMonthlySales(),
  ]);

  // Get product names for top products
  const topProductIds = topProducts.map((p) => p.productId);
  const productNames = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });

  const topProductsData = topProducts.map((p) => ({
    name: productNames.find((n) => n.id === p.productId)?.name ?? "Unknown",
    sold: p._sum.quantity ?? 0,
    revenue: p._sum.total ?? 0,
  }));

  const lowStock = lowStockProducts.filter(
    (p) => p.quantity <= p.minimumStock
  );

  return {
    todayRevenue: todaySales._sum.total ?? 0,
    todayOrders: todaySales._count,
    weekRevenue: weekSales._sum.total ?? 0,
    monthRevenue: monthSales._sum.total ?? 0,
    totalProducts,
    totalCustomers,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer?.name ?? "Walk-in",
      total: o.total,
      status: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
    })),
    topProducts: topProductsData,
    lowStockItems: lowStock.map((p) => ({
      name: p.name,
      stock: p.quantity,
      minimum: p.minimumStock,
    })),
    monthlySales: monthlySalesData,
  };
}

async function getMonthlySales() {
  const data: { name: string; sales: number; orders: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const sales = await prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        orderStatus: "COMPLETED",
      },
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    data.push({
      name: dayNames[date.getDay()],
      sales: sales._sum.total ?? 0,
      orders: sales._count,
    });
  }

  return data;
}