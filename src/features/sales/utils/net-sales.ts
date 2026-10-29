import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { money } from "@/features/pos/utils/checkout";

export async function netSalesSince(start: Date) {
  const where: Prisma.OrderWhereInput = {
    createdAt: { gte: start },
    orderStatus: { in: ["COMPLETED", "REFUNDED"] },
  };
  const [sales, refunds] = await prisma.$transaction(
    [
      prisma.order.aggregate({ where, _sum: { total: true }, _count: true }),
      prisma.refund.aggregate({
        where: { order: where },
        _sum: { amount: true },
      }),
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return {
    revenue: money((sales._sum.total ?? 0) - (refunds._sum.amount ?? 0)),
    orders: sales._count,
  };
}
