"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function getSales() {
  return prisma.order.findMany({
    include: {
      customer: { select: { name: true, phone: true } },
      cashier: { select: { name: true } },
      items: true,
      _count: { select: { items: true, refunds: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSaleById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      cashier: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, images: true } },
        },
      },
      payments: true,
      refunds: true,
    },
  });
}

export async function getSalesStats() {
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
    totalOrders,
    totalRefunds,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: today },
        orderStatus: "COMPLETED",
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: weekStart },
        orderStatus: "COMPLETED",
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: monthStart },
        orderStatus: "COMPLETED",
      },
    }),
    prisma.order.count({ where: { orderStatus: "COMPLETED" } }),
    prisma.refund.aggregate({ _sum: { amount: true }, _count: true }),
  ]);

  return {
    todayRevenue: todaySales._sum.total ?? 0,
    todayOrders: todaySales._count,
    weekRevenue: weekSales._sum.total ?? 0,
    weekOrders: weekSales._count,
    monthRevenue: monthSales._sum.total ?? 0,
    monthOrders: monthSales._count,
    totalOrders,
    totalRefundAmount: totalRefunds._sum.amount ?? 0,
    totalRefundCount: totalRefunds._count,
  };
}

export async function processRefundAction(
  orderId: string,
  amount: number,
  reason: string
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, refunds: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    const existingRefunds = order.refunds.reduce(
      (sum, r) => sum + r.amount,
      0
    );
    const maxRefundable = order.total - existingRefunds;

    if (amount > maxRefundable) {
      return {
        success: false,
        error: `Max refundable: Rs.${maxRefundable.toFixed(2)}`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.refund.create({
        data: {
          orderId,
          amount,
          reason,
          notes: `Refund for order ${order.orderNumber}`,
        },
      });

      const totalRefunded = existingRefunds + amount;
      const newStatus =
        totalRefunded >= order.total ? "REFUNDED" : "COMPLETED";

      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newStatus,
          paymentStatus:
            totalRefunded >= order.total ? "REFUNDED" : "PARTIAL",
        },
      });

      // Restore stock for full refund
      if (totalRefunded >= order.total) {
        for (const item of order.items) {
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
                type: "RETURN",
                quantity: item.quantity,
                beforeQty: product.quantity,
                afterQty: product.quantity + item.quantity,
                reference: order.orderNumber,
                notes: `Refund: ${reason}`,
              },
            });
          }
        }
      }

      // Update customer stats
      if (order.customerId) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalPurchases: { decrement: amount },
            loyaltyPoints: {
              decrement: Math.floor(amount / 100),
            },
          },
        });
      }
    });

    revalidatePath("/sales");
    revalidatePath(`/sales/${orderId}`);
    revalidatePath("/dashboard");
    revalidatePath("/inventory");

    return {
      success: true,
      message: `Refund of Rs.${amount.toFixed(2)} processed.`,
    };
  } catch {
    return { success: false, error: "Failed to process refund." };
  }
}