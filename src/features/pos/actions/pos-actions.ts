"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma, type PaymentMethod } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/authorization";
import { serializable } from "@/lib/transaction";
import { linkActiveShift } from "@/features/shifts/link-shift";
import {
  fingerprint,
  validateRequestKey,
  verifyReplay,
  RequestConflict,
} from "@/lib/idempotency";
import { allocateNetTotals } from "@/features/sales/utils/returns";
import type { CartItem } from "../store/cart-store";
import {
  CheckoutError,
  couponAmount,
  money,
  priceCheckout,
  validatePayment,
} from "../utils/checkout";

const salesRoles = ["OWNER", "ADMIN", "MANAGER", "CASHIER"] as const;

export async function getPOSProducts() {
  await requireStaff(salesRoles);
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
  await requireStaff(salesRoles);
  return prisma.customer.findMany({
    where: { isActive: true },
    select: { id: true, name: true, phone: true, loyaltyPoints: true },
    orderBy: { name: "asc" },
  });
}

export async function applyCouponAction(code: string, subtotal: number) {
  try {
    await requireStaff(salesRoles);
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    if (!coupon) return { success: false, error: "Invalid coupon code." };
    const discount = couponAmount(coupon, subtotal);
    return {
      success: true,
      discount,
      message: "Coupon applied! Rs." + discount.toFixed(2) + " off",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof CheckoutError
          ? error.message
          : "Unable to apply coupon. Check your session.",
    };
  }
}

export async function createOrderAction(data: {
  requestKey: string;
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
    const cashier = await requireStaff(salesRoles);
    validateRequestKey(data?.requestKey);
    if (
      !data ||
      !Array.isArray(data.items) ||
      data.items.length === 0 ||
      data.items.length > 500
    ) {
      throw new CheckoutError("Cart must contain between 1 and 500 items.");
    }
    if (
      typeof data.note !== "string" ||
      data.note.length > 2000 ||
      typeof data.couponCode !== "string"
    ) {
      throw new CheckoutError("Invalid order details.");
    }
    if (
      data.items.some(
        (item) =>
          !item ||
          typeof item.productId !== "string" ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.discount),
      ) ||
      !Number.isFinite(data.paidAmount) ||
      data.paidAmount < 0 ||
      !["CASH", "CARD", "BANK_TRANSFER", "QR"].includes(data.paymentMethod) ||
      (data.customerId !== null && typeof data.customerId !== "string")
    )
      throw new CheckoutError("Invalid checkout details.");
    const requestHash = fingerprint({
      cashierId: cashier.id,
      items: data.items
        .map(({ productId, quantity, discount }) => ({
          productId,
          quantity,
          discount,
        }))
        .sort((a, b) => a.productId.localeCompare(b.productId)),
      customerId: data.customerId || null,
      paymentMethod: data.paymentMethod,
      paidAmount: money(data.paidAmount),
      couponCode: data.couponCode.trim().toUpperCase(),
      note: data.note.trim(),
    });
    const orderNumber =
      "INV-" +
      new Date().toISOString().slice(0, 10).replaceAll("-", "") +
      "-" +
      randomUUID().slice(0, 8).toUpperCase();
    const order = await serializable(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { checkoutKey: data.requestKey },
      });
      if (existing) {
        verifyReplay(existing.requestHash, requestHash);
        return existing;
      }
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map((item) => item?.productId) } },
      });
      const priced = priceCheckout(
        data.items,
        products,
        ["OWNER", "ADMIN", "MANAGER"].includes(cashier.role),
      );
      if (data.customerId) {
        const customer = await tx.customer.findFirst({
          where: { id: data.customerId, isActive: true },
        });
        if (!customer)
          throw new CheckoutError("Customer is no longer available.");
      }
      const code = data.couponCode.toUpperCase().trim();
      let couponDiscount = 0;
      if (code) {
        const coupon = await tx.coupon.findUnique({ where: { code } });
        if (!coupon) throw new CheckoutError("Invalid coupon code.");
        couponDiscount = couponAmount(
          coupon,
          priced.subtotal,
          money(priced.subtotal - priced.itemDiscount),
        );
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
      const discountAmount = money(priced.itemDiscount + couponDiscount);
      const total = money(priced.subtotal + priced.taxAmount - discountAmount);
      const changeAmount = validatePayment(
        data.paymentMethod,
        data.paidAmount,
        total,
      );
      const paymentMethod = data.paymentMethod as PaymentMethod;
      const netTotals = allocateNetTotals(
        priced.items.map((item) => item.total),
        total,
      );
      for (const item of priced.items) {
        const changed = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            status: "ACTIVE",
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (changed.count !== 1)
          throw new CheckoutError(
            "Stock changed for " + item.name + ". Refresh and try again.",
          );
        const after = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: item.quantity,
            beforeQty: after.quantity + item.quantity,
            afterQty: after.quantity,
            reference: orderNumber,
            notes: "Sale: " + orderNumber,
          },
        });
      }
      const result = await tx.order.create({
        data: {
          shiftId: await linkActiveShift(tx, cashier.id),
          orderNumber,
          checkoutKey: data.requestKey,
          requestHash,
          customerId: data.customerId || null,
          cashierId: cashier.id,
          subtotal: priced.subtotal,
          taxAmount: priced.taxAmount,
          discountAmount,
          total,
          paidAmount: money(data.paidAmount),
          changeAmount,
          paymentMethod,
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          notes: data.note.trim() || null,
          items: {
            create: priced.items.map(
              (
                {
                  productId,
                  name,
                  sku,
                  quantity,
                  unitPrice,
                  discount,
                  tax,
                  total: itemTotal,
                },
                index,
              ) => ({
                productId,
                name,
                sku,
                quantity,
                unitPrice,
                discount,
                tax,
                total: itemTotal,
                netTotal: netTotals[index],
                unitCost: products.find((product) => product.id === productId)!
                  .purchasePrice,
              }),
            ),
          },
          payments: { create: { method: paymentMethod, amount: total } },
        },
      });
      if (data.customerId)
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            totalPurchases: { increment: total },
            totalOrders: { increment: 1 },
            loyaltyPoints: { increment: Math.floor(total / 100) },
          },
        });
      await tx.auditLog.create({
        data: {
          userId: cashier.id,
          action: "SALE_COMPLETED",
          entity: "Order",
          entityId: result.id,
          newValues: JSON.stringify({
            orderNumber: result.orderNumber,
            total: result.total,
            paymentMethod,
            requestKey: data.requestKey,
          }),
        },
      });
      return result;
    });
    for (const path of [
      "/pos",
      "/sales",
      "/inventory",
      "/products",
      "/customers",
      "/dashboard",
    ])
      revalidatePath(path);
    return {
      success: true,
      message: "Order " + order.orderNumber + " completed!",
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
      changeAmount: order.changeAmount,
    };
  } catch (error) {
    if (error instanceof CheckoutError)
      return {
        success: false,
        error: error.message,
        retryable: error instanceof RequestConflict,
      };
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return {
        success: false,
        error: "Stock or coupon changed during checkout. Please try again.",
        retryable: true,
      };
    }
    console.error("Order creation failed:", error);
    return {
      success: false,
      error: "Unable to complete sale. Check your session and try again.",
      retryable: true,
    };
  }
}
