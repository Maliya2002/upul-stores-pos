"use server";

import { requireStaff } from "@/lib/authorization";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CheckoutError, money } from "@/features/pos/utils/checkout";

export async function getSales() {
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
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
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
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
  await requireStaff(["OWNER", "ADMIN", "MANAGER", "CASHIER"]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const monthStart = new Date(today);
  monthStart.setDate(1);

  const [todaySales, weekSales, monthSales, totalOrders, totalRefunds] =
    await Promise.all([
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
  reason: string,
) {
  try {
    await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      money(amount) !== amount ||
      typeof reason !== "string" ||
      !reason.trim() ||
      reason.length > 2000
    ) {
      return {
        success: false,
        error:
          "Enter a positive refund amount (up to two decimals) and a reason.",
      };
    }
    await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true, refunds: true },
        });

        if (!order || order.orderStatus !== "COMPLETED")
          throw new CheckoutError("Order cannot be refunded.");

        const existingRefunds = order.refunds.reduce(
          (sum, r) => sum + r.amount,
          0,
        );
        const maxRefundable = money(
          Math.min(order.total, order.paidAmount - order.changeAmount) -
            existingRefunds,
        );

        if (amount > maxRefundable) {
          throw new CheckoutError(
            `Max refundable: Rs.${maxRefundable.toFixed(2)}`,
          );
        }

        await tx.refund.create({
          data: {
            orderId,
            amount,
            reason,
            notes: `Refund for order ${order.orderNumber}`,
          },
        });

        const totalRefunded = money(existingRefunds + amount);
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
                decrement:
                  Math.floor(totalRefunded / 100) -
                  Math.floor(existingRefunds / 100),
              },
            },
          });
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidatePath("/sales");
    revalidatePath(`/sales/${orderId}`);
    revalidatePath("/dashboard");
    revalidatePath("/inventory");
    revalidatePath("/pos");
    revalidatePath("/products");
    revalidatePath("/customers");

    return {
      success: true,
      message: `Refund of Rs.${amount.toFixed(2)} processed.`,
    };
  } catch (error) {
    if (error instanceof CheckoutError)
      return { success: false, error: error.message };
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return {
        success: false,
        error:
          "Another refund or stock update is in progress. Please try again.",
      };
    }
    return { success: false, error: "Failed to process refund." };
  }
}
