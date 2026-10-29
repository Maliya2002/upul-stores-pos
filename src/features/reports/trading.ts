import type { Prisma } from "@prisma/client";

export function reportPeriods(now = new Date()) {
  const local = new Date(now.getTime() + 330 * 60000);
  const year = local.getUTCFullYear(),
    month = local.getUTCMonth();
  const midnight = (y: number, m: number, d = 1) =>
    new Date(Date.UTC(y, m, d) - 330 * 60000);
  const today = midnight(year, month, local.getUTCDate());
  return {
    today,
    week: new Date(today.getTime() - 6 * 86400000),
    month: midnight(year, month),
    year: midnight(year, 0),
    end: new Date(now.getTime() + 1),
    months: Array.from({ length: 6 }, (_, i) => ({
      start: midnight(year, month - 5 + i),
      end: midnight(year, month - 4 + i),
      label: new Date(Date.UTC(year, month - 5 + i, 1)).toLocaleString("en", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    })),
  };
}

type Line = {
  quantity: number;
  unitCost: number | null;
  netTotal: number | null;
  tax: number;
};
type Sale = { total: number; items: Line[] };
type Return = {
  amount: number;
  items: {
    quantity: number;
    restock: boolean;
    amount: number;
    orderItem: Line;
  }[];
};
const cents = (v: number) => Math.round(v * 100);

export function summarizeTrading(
  sales: Sale[],
  refunds: Return[],
  expenses: number,
) {
  let cost = 0,
    exclusiveSales = 0,
    exclusiveRefunds = 0,
    incomplete = 0;
  for (const sale of sales) {
    if (
      !sale.items.length ||
      sale.items.some((i) => i.unitCost === null || i.netTotal === null) ||
      sale.items.reduce((sum, i) => sum + cents(i.netTotal ?? 0), 0) !==
        cents(sale.total)
    )
      incomplete++;
    for (const item of sale.items) {
      cost += cents(item.unitCost ?? 0) * item.quantity;
      exclusiveSales += Math.round(
        cents(item.netTotal ?? 0) / (1 + item.tax / 100),
      );
    }
  }
  for (const refund of refunds) {
    if (
      !refund.items.length ||
      refund.items.some((i) => i.orderItem.unitCost === null) ||
      refund.items.reduce((sum, i) => sum + cents(i.amount), 0) !==
        cents(refund.amount)
    )
      incomplete++;
    for (const item of refund.items) {
      if (item.restock)
        cost -= cents(item.orderItem.unitCost ?? 0) * item.quantity;
      exclusiveRefunds += Math.round(
        cents(item.amount) / (1 + item.orderItem.tax / 100),
      );
    }
  }
  const gross = sales.reduce((sum, s) => sum + cents(s.total), 0);
  const returned = refunds.reduce((sum, r) => sum + cents(r.amount), 0);
  return {
    revenue: (gross - returned) / 100,
    grossSales: gross / 100,
    refunds: returned / 100,
    orders: sales.length,
    expenses,
    incomplete,
    cost: incomplete ? null : cost / 100,
    profit: incomplete
      ? null
      : (exclusiveSales - exclusiveRefunds - cost - cents(expenses)) / 100,
  };
}

export async function periodTrading(
  tx: Prisma.TransactionClient,
  start: Date,
  end: Date,
) {
  const dates = { gte: start, lt: end };
  const [sales, refunds, expenses] = await Promise.all([
    tx.order.findMany({
      where: {
        createdAt: dates,
        orderStatus: { in: ["COMPLETED", "REFUNDED"] },
      },
      select: {
        total: true,
        items: {
          select: { quantity: true, unitCost: true, netTotal: true, tax: true },
        },
      },
    }),
    tx.refund.findMany({
      where: {
        createdAt: dates,
        order: { orderStatus: { in: ["COMPLETED", "REFUNDED"] } },
      },
      select: {
        amount: true,
        items: {
          select: {
            quantity: true,
            restock: true,
            amount: true,
            orderItem: {
              select: {
                quantity: true,
                unitCost: true,
                netTotal: true,
                tax: true,
              },
            },
          },
        },
      },
    }),
    tx.expense.aggregate({ where: { paidAt: dates }, _sum: { amount: true } }),
  ]);
  return summarizeTrading(sales, refunds, expenses._sum.amount ?? 0);
}
