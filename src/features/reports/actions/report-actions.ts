"use server";

import { requireStaff } from "@/lib/authorization";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { periodTrading, reportPeriods } from "../trading";

export async function getDashboardReport() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const periods = reportPeriods();
  return prisma.$transaction(
    async (tx) => {
      const [
        todaySales,
        weekSales,
        monthSales,
        yearSales,
        totalExpenses,
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
        periodTrading(tx, periods.today, periods.end),
        periodTrading(tx, periods.week, periods.end),
        periodTrading(tx, periods.month, periods.end),
        periodTrading(tx, periods.year, periods.end),
        tx.expense.aggregate({ _sum: { amount: true } }),
        // Counts
        tx.product.count({ where: { isActive: true } }),
        tx.customer.count({ where: { isActive: true } }),
        tx.supplier.count({ where: { isActive: true } }),
        // Low stock
        tx.product.findMany({
          where: { isActive: true },
          select: { quantity: true, minimumStock: true },
        }),
        // Out of stock
        tx.product.count({ where: { isActive: true, quantity: 0 } }),
        // Recent orders
        tx.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { name: true } },
          },
        }),
        // Top products
        tx.orderItem.groupBy({
          by: ["productId"],
          where: { order: { orderStatus: { in: ["COMPLETED", "REFUNDED"] } } },
          _sum: { quantity: true, total: true },
          orderBy: { _sum: { total: "desc" } },
          take: 10,
        }),
        // Monthly sales (last 6 months)
        Promise.all(
          periods.months.map(async (period) => ({
            month: period.label,
            ...(await periodTrading(
              tx,
              period.start,
              new Date(Math.min(period.end.getTime(), periods.end.getTime())),
            )),
          })),
        ),
        // Expense by category
        tx.expense.groupBy({
          by: ["category"],
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Get top product names
      const topProductIds = topProducts.map((p) => p.productId);
      const productDetails = await tx.product.findMany({
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
      const lowStock = (
        lowStockCount as { quantity: number; minimumStock: number }[]
      ).filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock).length;

      return {
        today: todaySales,
        week: weekSales,
        month: monthSales,
        year: yearSales,
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
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      timeout: 30000,
    },
  );
}
