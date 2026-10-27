"use server";

import { requireStaff } from "@/lib/authorization";

import prisma from "@/lib/prisma";
import { netSalesSince } from "../utils/net-sales";

import { processItemReturn } from "./return-actions";
import type { RefundRequest } from "../utils/returns";

export async function getSales() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  return prisma.order.findMany({
    include: {
      customer: { select: { name: true, phone: true } },
      cashier: { select: { name: true } },
      items: true,
      refunds: { select: { amount: true } },
      _count: { select: { items: true, refunds: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSaleById(id: string) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      cashier: { select: { name: true, email: true } },
      items: {
        orderBy: { id: "asc" },
        include: {
          refundItems: true,
          product: { select: { name: true, images: true } },
        },
      },
      payments: true,
      refunds: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { orderItem: { select: { name: true } } } },
          processedBy: { select: { name: true } },
        },
      },
    },
  });
}

export async function getSalesStats() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const today = new Date(`${date}T00:00:00+05:30`);
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(`${date.slice(0, 7)}-01T00:00:00+05:30`);
  const [todaySales, weekSales, monthSales, totalOrders, refunds] =
    await Promise.all([
      netSalesSince(today),
      netSalesSince(weekStart),
      netSalesSince(monthStart),
      prisma.order.count({
        where: { orderStatus: { in: ["COMPLETED", "REFUNDED"] } },
      }),
      prisma.refund.aggregate({ _sum: { amount: true }, _count: true }),
    ]);
  return {
    todayRevenue: todaySales.revenue,
    todayOrders: todaySales.orders,
    weekRevenue: weekSales.revenue,
    weekOrders: weekSales.orders,
    monthRevenue: monthSales.revenue,
    monthOrders: monthSales.orders,
    totalOrders,
    totalRefundAmount: refunds._sum.amount ?? 0,
    totalRefundCount: refunds._count,
  };
}
export async function processRefundAction(data: RefundRequest) {
  return processItemReturn(data);
}
