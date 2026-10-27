"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/authorization";
import { serializable } from "@/lib/transaction";
import {
  fingerprint,
  validateRequestKey,
  verifyReplay,
  RequestConflict,
} from "@/lib/idempotency";
import { CheckoutError, money } from "@/features/pos/utils/checkout";
import { quoteReturn, type RefundRequest } from "../utils/returns";

export async function processItemReturn(data: RefundRequest) {
  try {
    const staff = await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
    validateRequestKey(data?.requestKey);
    if (
      !data ||
      typeof data.orderId !== "string" ||
      typeof data.reason !== "string" ||
      !data.reason.trim() ||
      data.reason.length > 2000 ||
      !["CASH", "CARD", "BANK_TRANSFER", "QR"].includes(data.method) ||
      !Array.isArray(data.items) ||
      !data.items.length ||
      data.items.length > 500 ||
      data.items.some(
        (item) =>
          !item ||
          typeof item.orderItemId !== "string" ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0 ||
          typeof item.restock !== "boolean",
      )
    )
      throw new CheckoutError(
        "Select valid return items, a refund method and a reason.",
      );
    const requestHash = fingerprint({
      staffId: staff.id,
      orderId: data.orderId,
      reason: data.reason.trim(),
      method: data.method,
      items: [...data.items]
        .map(({ orderItemId, quantity, restock }) => ({
          orderItemId,
          quantity,
          restock,
        }))
        .sort((a, b) => a.orderItemId.localeCompare(b.orderItemId)),
    });
    const refund = await serializable(async (tx) => {
      const existing = await tx.refund.findUnique({
        where: { requestKey: data.requestKey },
      });
      if (existing) {
        verifyReplay(existing.requestHash, requestHash);
        return existing;
      }
      const order = await tx.order.findUnique({
        where: { id: data.orderId },
        include: {
          items: { orderBy: { id: "asc" }, include: { refundItems: true } },
          refunds: { include: { items: true } },
        },
      });
      if (!order || order.orderStatus !== "COMPLETED")
        throw new CheckoutError("This invoice cannot accept further returns.");
      if (order.refunds.some((previous) => previous.items.length === 0))
        throw new CheckoutError(
          "This invoice has an older amount-only refund. A manager must reconcile its returned quantities before item returns can be recorded.",
        );
      const lines = quoteReturn(order.items, order.total, data.items);
      const amount = money(lines.reduce((sum, line) => sum + line.amount, 0));
      const alreadyRefunded = money(
        order.refunds.reduce((sum, previous) => sum + previous.amount, 0),
      );
      if (
        amount >
        money(
          Math.min(order.total, order.paidAmount - order.changeAmount) -
            alreadyRefunded,
        )
      )
        throw new CheckoutError(
          "The return exceeds the remaining paid balance.",
        );
      const result = await tx.refund.create({
        data: {
          orderId: order.id,
          amount,
          reason: data.reason.trim(),
          method: data.method,
          requestKey: data.requestKey,
          requestHash,
          processedById: staff.id,
          items: { create: lines },
        },
      });
      for (const line of lines) {
        if (!line.restock) continue;
        const item = order.items.find((item) => item.id === line.orderItemId)!;
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: line.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "RETURN",
            quantity: line.quantity,
            beforeQty: product.quantity - line.quantity,
            afterQty: product.quantity,
            reference: result.id,
            notes: `Return against ${order.orderNumber}: ${data.reason.trim()}`,
          },
        });
      }
      const fullyReturned = order.items.every(
        (item) =>
          item.refundItems.reduce(
            (sum, returned) => sum + returned.quantity,
            0,
          ) +
            (lines.find((line) => line.orderItemId === item.id)?.quantity ??
              0) ===
          item.quantity,
      );
      const refunded = money(alreadyRefunded + amount);
      // Updating the parent also serializes concurrent returns of non-restocked items.
      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: fullyReturned ? "REFUNDED" : "COMPLETED",
          paymentStatus: fullyReturned ? "REFUNDED" : "PARTIAL",
        },
      });
      if (order.customerId)
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalPurchases: { decrement: amount },
            loyaltyPoints: {
              decrement:
                Math.floor(refunded / 100) - Math.floor(alreadyRefunded / 100),
            },
          },
        });
      await tx.auditLog.create({
        data: {
          userId: staff.id,
          action: "ITEMS_RETURNED",
          entity: "Refund",
          entityId: result.id,
          newValues: JSON.stringify({
            orderId: order.id,
            amount,
            method: data.method,
            reason: data.reason.trim(),
            items: lines,
          }),
        },
      });
      return result;
    });
    for (const path of [
      "/sales",
      `/sales/${data.orderId}`,
      "/dashboard",
      "/inventory",
      "/pos",
      "/products",
      "/customers",
      "/reports",
    ])
      revalidatePath(path);
    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      message: `Return recorded: Rs.${refund.amount.toFixed(2)} refunded.`,
    };
  } catch (error) {
    if (error instanceof CheckoutError)
      return {
        success: false,
        retryable: error instanceof RequestConflict,
        error: error.message,
      };
    console.error("Item return failed:", error);
    return {
      success: false,
      retryable: true,
      error:
        "Return could not be confirmed. Check your connection and session, then retry the saved return.",
    };
  }
}
