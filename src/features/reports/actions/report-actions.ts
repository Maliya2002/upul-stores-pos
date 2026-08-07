"use server";

import prisma from "@/lib/prisma";

export async function getDashboardReport() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const monthStart = new Date(today);
  monthStart.setDate(1);

  const yearStart = new Date(today.getFullYear(), 0, 1);

  const [
    todaySales,
    weekSales,
    monthSales,
    yearSales,
    totalExpenses,
    monthExpenses,
    totalProducts,
    totalCustomers,
    totalSuppliers,
    lowStockCount,
    outOfStockCount,
    recentOrders,
    topProducts,
    monthlySalesData,
    expenseByCategory,
  ] = await Promise.all([
    // Today sales
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: today }, orderStatus: "COMPLETED" },
    }),
    // Week sales
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: weekStart }, orderStatus: "COMPLETED" },
    }),
    // Month sales
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: monthStart }, orderStatus: "COMPLETED" },
    }),
    // Year sales
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: yearStart }, orderStatus: "COMPLETED" },
    }),
    // Total expenses
    prisma.expense.aggregate({ _sum: { amount: true } }),
    // Month expenses
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart } },
    }),
    // Counts
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } }),
    // Low stock
    prisma.product.findMany({
      where: { isActive: true },
      select: { quantity: true, minimumStock: true },
    }),
    // Out of stock
    prisma.product.count({ where: { isActive: true, quantity: 0 } }),
    // Recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
      },
    }),
    // Top products
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }),
    // Monthly sales (last 6 months)
    getMonthlySalesData(),
    // Expense by category
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Get top product names
  const topProductIds = topProducts.map((p) => p.productId);
  const productDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, sellingPrice: true },
  });

  const topProductsWithNames = topProducts.map((p) => {
    const detail = productDetails.find((d) => d.id === p.productId);
    return {
      name: detail?.name ?? "Unknown",
      unitsSold: p._sum.quantity ?? 0,
      revenue: p._sum.total ?? 0,
    };
  });

  // Calculate low stock
  const lowStock = (lowStockCount as { quantity: number; minimumStock: number }[]).filter(
    (p) => p.quantity > 0 && p.quantity <= p.minimumStock
  ).length;

  const monthRevenue = monthSales._sum.total ?? 0;
  const monthExpenseTotal = monthExpenses._sum.amount ?? 0;
  const monthProfit = monthRevenue - monthExpenseTotal;

  return {
    today: {
      revenue: todaySales._sum.total ?? 0,
      orders: todaySales._count,
    },
    week: {
      revenue: weekSales._sum.total ?? 0,
      orders: weekSales._count,
    },
    month: {
      revenue: monthRevenue,
      orders: monthSales._count,
      expenses: monthExpenseTotal,
      profit: monthProfit,
    },
    year: {
      revenue: yearSales._sum.total ?? 0,
      orders: yearSales._count,
    },
    totals: {
      products: totalProducts,
      customers: totalCustomers,
      suppliers: totalSuppliers,
      expenses: totalExpenses._sum.amount ?? 0,
      lowStock,
      outOfStock: outOfStockCount,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer?.name ?? "Walk-in",
      total: o.total,
      status: o.orderStatus,
      date: o.createdAt.toISOString(),
    })),
    topProducts: topProductsWithNames,
    monthlySales: monthlySalesData,
    expenseByCategory: expenseByCategory.map((e) => ({
      category: e.category,
      amount: e._sum.amount ?? 0,
      count: e._count,
    })),
  };
}

async function getMonthlySalesData() {
  const months: { month: string; revenue: number; orders: number; expenses: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const [sales, expenses] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
          orderStatus: "COMPLETED",
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    const monthName = start.toLocaleString("en", { month: "short" });

    months.push({
      month: monthName,
      revenue: sales._sum.total ?? 0,
      orders: sales._count,
      expenses: expenses._sum.amount ?? 0,
    });
  }

  return months;
}