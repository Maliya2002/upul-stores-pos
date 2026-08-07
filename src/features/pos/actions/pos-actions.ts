"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import type { CartItem } from "../store/cart-store";

export async function getPOSProducts() {
  return prisma.product.findMany({
    where: { isActive: true, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      sku: true,
      barcode: true,
      sellingPrice: true,
      tax: true,
      discount: true,
      quantity: true,
      images: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPOSCustomers() {
  return prisma.customer.findMany({
    where: { isActive: true },
    select: { id: true, name: true, phone: true, loyaltyPoints: true },
    orderBy: { name: "asc" },
  });
}

export async function applyCouponAction(code: string, subtotal: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) return { success: false, error: "Invalid coupon code." };
    if (!coupon.isActive) return { success: false, error: "Coupon is inactive." };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { success: false, error: "Coupon has expired." };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached." };
    }
    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      return {
        success: false,
        error: `Minimum order Rs.${coupon.minimumAmount} required.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    return {
      success: true,
      discount: Math.min(discount, subtotal),
      message: `Coupon applied! Rs.${discount.toFixed(2)} off`,
    };
  } catch {
    return { success: false, error: "Failed to apply coupon." };
  }
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}${d}-${rand}`;
}

export async function createOrderAction(data: {
  items: CartItem[];
  customerId: string | null;
  cashierId: string;
  paymentMethod: string;
  paidAmount: number;
  couponCode: string;
  couponDiscount: number;
  note: string;
}) {
  try {
    if (data.items.length === 0) {
      return { success: false, error: "Cart is empty." };
    }

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const taxAmount = data.items.reduce((sum, item) => {
      const base = item.price * item.quantity;
      const disc = (base * item.discount) / 100;
      return sum + ((base - disc) * item.tax) / 100;
    }, 0);

    const discountAmount =
      data.items.reduce(
        (sum, item) =>
          sum + (item.price * item.quantity * item.discount) / 100,
        0
      ) + data.couponDiscount;

    const total = Math.max(0, subtotal + taxAmount - discountAmount);
    const changeAmount = Math.max(0, data.paidAmount - total);
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: data.customerId || null,
          cashierId: data.cashierId,
          subtotal,
          taxAmount,
          discountAmount,
          total,
          paidAmount: data.paidAmount,
          changeAmount,
          paymentMethod: data.paymentMethod as
            | "CASH"
            | "CARD"
            | "BANK_TRANSFER"
            | "QR"
            | "GIFT_CARD"
            | "MIXED",
          paymentStatus: data.paidAmount >= total ? "PAID" : "PARTIAL",
          orderStatus: "COMPLETED",
          notes: data.note || null,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.price,
              discount: item.discount,
              tax: item.tax,
              total: item.total,
            })),
          },
          payments: {
            create: {
              method: data.paymentMethod as
                | "CASH"
                | "CARD"
                | "BANK_TRANSFER"
                | "QR"
                | "GIFT_CARD"
                | "MIXED",
              amount: data.paidAmount,
            },
          },
        },
      });

      // Update stock
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: "SALE",
              quantity: item.quantity,
              beforeQty: product.quantity,
              afterQty: product.quantity - item.quantity,
              reference: orderNumber,
              notes: `Sale: ${orderNumber}`,
            },
          });
        }
      }

      // Update coupon usage
      if (data.couponCode) {
        await tx.coupon.updateMany({
          where: { code: data.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Update customer stats
      if (data.customerId) {
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            totalPurchases: { increment: total },
            totalOrders: { increment: 1 },
            loyaltyPoints: { increment: Math.floor(total / 100) },
          },
        });
      }

      return newOrder;
    });

    revalidatePath("/pos");
    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Order ${orderNumber} completed!`,
      orderNumber,
      orderId: order.id,
      total,
      changeAmount,
    };
  } catch (error) {
    console.error("Order creation failed:", error);
    return { success: false, error: "Failed to create order." };
  }
}