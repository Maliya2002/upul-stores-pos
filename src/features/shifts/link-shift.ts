import type { Prisma } from "@prisma/client";

// Touching the shift row makes a concurrent close conflict and retry.
// Existing installations can continue trading without an open shift; those
// transactions remain unassigned rather than changing historical balances.
export async function linkActiveShift(tx: Prisma.TransactionClient, cashierId: string) {
  const shift = await tx.cashShift.findUnique({ where: { activeCashierId: cashierId } });
  if (!shift) return null;
  await tx.cashShift.update({ where: { id: shift.id }, data: { revision: { increment: 1 } } });
  return shift.id;
}
