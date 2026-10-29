"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/authorization";
import { cashBalance } from "./balance";
import { shiftDateRange } from "./date-range";

export async function getShiftReconciliation(input: { status?: string; cashierId?: string; page?: number; from?: string; through?: string } = {}) {
  await requireStaff(["OWNER", "ADMIN", "MANAGER"]);
  const status = ["open", "closed", "difference"].includes(input.status ?? "") ? input.status : "all";
  const page = Number.isSafeInteger(input.page) && input.page! > 0 ? Math.min(input.page!, 100000) : 1;
  const range = shiftDateRange(input.from, input.through);
  const where: Prisma.CashShiftWhereInput = {
    ...(range.error ? { id: { in: [] } } : { openedAt: range.openedAt }),
    ...(input.cashierId ? { cashierId: input.cashierId } : {}),
    ...(status === "open" ? { closedAt: null } : {}),
    ...(status === "closed" ? { closedAt: { not: null } } : {}),
    ...(status === "difference" ? { closedAt: { not: null }, variance: { not: 0 } } : {}),
  };
  return prisma.$transaction(async tx => {
    const count = await tx.cashShift.count({ where });
    const pages = Math.max(1, Math.ceil(count / 20));
    const currentPage = Math.min(page, pages);
    const shifts = await tx.cashShift.findMany({
      where, take: 20, skip: (currentPage - 1) * 20,
      orderBy: [{ openedAt: "desc" }, { id: "desc" }],
      include: {
        cashier: { select: { name: true } },
        orders: { select: { total: true, paymentMethod: true } },
        refunds: { select: { amount: true, method: true } },
        movements: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
      },
    });
    const cashiers = await tx.user.findMany({ where: { cashShifts: { some: {} } }, select: { id: true, name: true, isActive: true }, orderBy: [{ name: "asc" }, { id: "asc" }] });
    return {
      count, pages, page: currentPage, cashiers, error: range.error,
      shifts: shifts.map(({ orders, refunds, ...shift }) => {
        const sum = (values: number[]) => values.reduce((total, value) => total + Math.round(value * 100), 0) / 100;
        const sales = orders.filter(order => order.paymentMethod === "CASH").map(order => order.total);
        const cashRefunds = refunds.filter(refund => refund.method === "CASH").map(refund => refund.amount);
        return {
          ...shift,
          cashSales: sum(sales), nonCashSales: sum(orders.filter(order => order.paymentMethod !== "CASH").map(order => order.total)),
          cashRefunds: sum(cashRefunds),
          cashIn: sum(shift.movements.filter(m => m.direction === "IN").map(m => m.amount)),
          cashOut: sum(shift.movements.filter(m => m.direction === "OUT").map(m => m.amount)),
          expected: shift.closedAt ? shift.expectedCash! : cashBalance(shift.openingCash, sales, cashRefunds, shift.movements),
        };
      }),
    };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
