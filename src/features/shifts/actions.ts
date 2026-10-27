"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/authorization";
import { serializable } from "@/lib/transaction";
import { validateRequestKey } from "@/lib/idempotency";
import { CheckoutError } from "@/features/pos/utils/checkout";
import { cashBalance } from "./balance";

const roles = ["OWNER", "ADMIN", "MANAGER", "CASHIER"] as const;
function amount(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 100000000 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001)
    throw new CheckoutError("Enter a valid amount with at most two decimal places.");
  return Math.round(value * 100) / 100;
}

export async function getShifts() {
  const staff = await requireStaff(roles);
  return prisma.cashShift.findMany({ where: { cashierId: staff.id }, orderBy: { openedAt: "desc" }, take: 30,
    include: { orders: { select: { total: true, paymentMethod: true } }, refunds: { select: { amount: true, method: true } }, movements: { orderBy: { createdAt: "desc" } } } });
}

export async function openShift(requestKey: string, openingCash: number) {
  try {
    const staff = await requireStaff(roles);
    validateRequestKey(requestKey);
    const opening = amount(openingCash);
    await serializable(async tx => {
      const replay = await tx.cashShift.findUnique({ where: { requestKey } });
      if (replay) {
        if (replay.cashierId !== staff.id || replay.openingCash !== opening) throw new CheckoutError("This request was already used with different details.");
        return;
      }
      if (await tx.cashShift.findUnique({ where: { activeCashierId: staff.id } })) throw new CheckoutError("Close your current shift first.");
      const shift = await tx.cashShift.create({ data: { cashierId: staff.id, activeCashierId: staff.id, requestKey, openingCash: opening } });
      await tx.auditLog.create({ data: { userId: staff.id, action: "SHIFT_OPENED", entity: "CashShift", entityId: shift.id, newValues: JSON.stringify({ openingCash: opening }) } });
    });
    revalidatePath("/shifts");
    return { success: true as const };
  } catch (error) { return { success: false as const, retryable: !(error instanceof CheckoutError), error: error instanceof CheckoutError ? error.message : "Could not open shift. Retry with the same details." }; }
}

export async function recordCashMovement(requestKey: string, shiftId: string, direction: "IN" | "OUT", cash: number, reason: string) {
  try {
    const staff = await requireStaff(roles);
    validateRequestKey(requestKey);
    const value = amount(cash);
    if (!value || !["IN", "OUT"].includes(direction) || typeof reason !== "string" || !reason.trim() || reason.length > 500) throw new CheckoutError("Enter a positive amount and a reason (up to 500 characters).");
    await serializable(async tx => {
      const shift = await tx.cashShift.findUnique({ where: { id: shiftId } });
      if (!shift || shift.cashierId !== staff.id) throw new CheckoutError("Shift not found.");
      const replay = await tx.cashMovement.findUnique({ where: { requestKey } });
      if (replay) {
        if (replay.shiftId !== shiftId || replay.amount !== value || replay.direction !== direction || replay.reason !== reason.trim()) throw new CheckoutError("This request was already used with different details.");
        return;
      }
      if (shift.closedAt) throw new CheckoutError("This shift is closed.");
      await tx.cashShift.update({ where: { id: shift.id }, data: { revision: { increment: 1 } } });
      const entry = await tx.cashMovement.create({ data: { shiftId, requestKey, direction, amount: value, reason: reason.trim() } });
      await tx.auditLog.create({ data: { userId: staff.id, action: "CASH_" + direction, entity: "CashMovement", entityId: entry.id, newValues: JSON.stringify({ shiftId, amount: value, reason: reason.trim() }) } });
    });
    revalidatePath("/shifts");
    return { success: true as const };
  } catch (error) { return { success: false as const, retryable: !(error instanceof CheckoutError), error: error instanceof CheckoutError ? error.message : "Could not record movement. Retry with the same details." }; }
}

export async function closeShift(shiftId: string, countedCash: number, note: string) {
  try {
    const staff = await requireStaff(roles);
    const counted = amount(countedCash);
    if (typeof note !== "string" || note.length > 500) throw new CheckoutError("Note must be at most 500 characters.");
    await serializable(async tx => {
      const shift = await tx.cashShift.findUnique({ where: { id: shiftId }, include: { orders: true, refunds: true, movements: true } });
      if (!shift || shift.cashierId !== staff.id) throw new CheckoutError("Shift not found.");
      if (shift.closedAt) {
        if (shift.countedCash !== counted || shift.closeNote !== note.trim()) throw new CheckoutError("This shift is already closed with different details.");
        return;
      }
      const expected = cashBalance(shift.openingCash, shift.orders.filter(o => o.paymentMethod === "CASH").map(o => o.total), shift.refunds.filter(r => r.method === "CASH").map(r => r.amount), shift.movements);
      const variance = Math.round((counted - expected) * 100) / 100;
      if (variance !== 0 && !note.trim()) throw new CheckoutError("Explain the cash difference before closing.");
      await tx.cashShift.update({ where: { id: shift.id }, data: { activeCashierId: null, closedAt: new Date(), countedCash: counted, expectedCash: expected, variance, closeNote: note.trim(), revision: { increment: 1 } } });
      await tx.auditLog.create({ data: { userId: staff.id, action: "SHIFT_CLOSED", entity: "CashShift", entityId: shift.id, newValues: JSON.stringify({ expected, counted, variance, note: note.trim() }) } });
    });
    revalidatePath("/shifts");
    return { success: true as const };
  } catch (error) { return { success: false as const, retryable: !(error instanceof CheckoutError), error: error instanceof CheckoutError ? error.message : "Could not close shift. Retry with the same details." }; }
}
