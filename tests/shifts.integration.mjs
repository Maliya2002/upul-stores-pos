import "./action-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const url = new URL(process.env.DATABASE_URL);
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "55432");
assert.equal(url.pathname, "/upul_pos");
const { default: prisma } = await import("../src/lib/prisma.ts");
const { openShift, recordCashMovement, closeShift } = await import("../src/features/shifts/actions.ts");
const { serializable } = await import("../src/lib/transaction.ts");
const { linkActiveShift } = await import("../src/features/shifts/link-shift.ts");
const { getShiftReconciliation } = await import("../src/features/shifts/reconciliation.ts");

test("cash shifts enforce ownership, replay safety and immutable closing balances", async () => {
  const prefix = `shift-${randomUUID()}`;
  const user = await prisma.user.create({ data: { name: prefix, email: `${prefix}@example.invalid`, password: "not-login", role: "CASHIER" } });
  const other = await prisma.user.create({ data: { name: prefix, email: `other-${prefix}@example.invalid`, password: "not-login", role: "INVENTORY_STAFF" } });
  process.env.TEST_STAFF_ID = user.id;
  try {
    const key = randomUUID();
    const opened = await Promise.all([openShift(key, 1000), openShift(key, 1000)]);
    assert.ok(opened.every(r => r.success));
    const shift = await prisma.cashShift.findUniqueOrThrow({ where: { requestKey: key } });
    assert.equal((await openShift(randomUUID(), 100)).success, false);
    assert.equal((await openShift(key, 2000)).success, false);
    const movementKey = randomUUID();
    assert.ok((await recordCashMovement(movementKey, shift.id, "IN", 50, "float")).success);
    assert.ok((await recordCashMovement(movementKey, shift.id, "IN", 50, "float")).success);
    assert.equal((await recordCashMovement(movementKey, shift.id, "IN", 60, "float")).success, false);
    assert.ok((await recordCashMovement(randomUUID(), shift.id, "OUT", 20, "petty cash")).success);
    assert.equal(await prisma.cashMovement.count({ where: { shiftId: shift.id } }), 2);
    const sale = await serializable(async tx => tx.order.create({ data: {
      shiftId: await linkActiveShift(tx, user.id), cashierId: user.id,
      orderNumber: prefix, subtotal: 200, total: 200, paymentMethod: "CASH",
      paidAmount: 500, changeAmount: 300,
    } }));
    await serializable(async tx => tx.order.create({ data: {
      shiftId: await linkActiveShift(tx, user.id), cashierId: user.id,
      orderNumber: prefix + "-card", subtotal: 900, total: 900, paymentMethod: "CARD",
    } }));
    await serializable(async tx => tx.refund.create({ data: {
      shiftId: await linkActiveShift(tx, user.id), orderId: sale.id, amount: 30, method: "CASH", processedById: user.id,
    } }));
    process.env.TEST_STAFF_ID = other.id;
    await prisma.user.update({ where: { id: other.id }, data: { role: "CASHIER" } });
    assert.equal((await closeShift(shift.id, 1200, "")).success, false);
    assert.equal((await recordCashMovement(randomUUID(), shift.id, "OUT", 1, "other drawer")).success, false);
    await prisma.user.update({ where: { id: other.id }, data: { role: "INVENTORY_STAFF" } });
    assert.equal((await openShift(randomUUID(), 1)).success, false);
    process.env.TEST_STAFF_ID = user.id;
    assert.equal((await closeShift(shift.id, 1190, "")).success, false);
    assert.ok((await closeShift(shift.id, 1190, "Ten short")).success);
    assert.ok((await closeShift(shift.id, 1190, "Ten short")).success);
    assert.equal((await recordCashMovement(randomUUID(), shift.id, "IN", 1, "late")).success, false);
    const closed = await prisma.cashShift.findUniqueOrThrow({ where: { id: shift.id } });
    assert.equal(closed.expectedCash, 1200);
    assert.equal(closed.variance, -10);
    assert.equal(closed.activeCashierId, null);
    await assert.rejects(getShiftReconciliation({ cashierId: user.id }));
    await prisma.user.update({ where: { id: other.id }, data: { role: "MANAGER" } });
    process.env.TEST_STAFF_ID = other.id;
    const review = await getShiftReconciliation({ cashierId: user.id, status: "difference" });
    assert.equal(review.count, 1);
    assert.equal(review.shifts[0].cashSales, 200);
    assert.equal(review.shifts[0].nonCashSales, 900);
    assert.equal(review.shifts[0].cashRefunds, 30);
    assert.equal(review.shifts[0].cashIn, 50);
    assert.equal(review.shifts[0].cashOut, 20);
    assert.equal(review.shifts[0].expected, 1200);
    assert.equal(review.shifts[0].variance, -10);
    assert.equal((await getShiftReconciliation({ cashierId: user.id, status: "open" })).count, 0);
    assert.equal((await getShiftReconciliation({ cashierId: other.id })).count, 0);
    assert.equal((await getShiftReconciliation({ cashierId: user.id, page: 999 })).page, 1);
    const dateFilter = { cashierId: user.id, status: "difference", from: "2026-10-28", through: "2026-10-28" };
    for (const [instant, expectedCount] of [
      ["2026-10-27T18:29:59.999Z", 0],
      ["2026-10-27T18:30:00.000Z", 1],
      ["2026-10-28T18:29:59.999Z", 1],
      ["2026-10-28T18:30:00.000Z", 0],
    ]) {
      await prisma.cashShift.update({ where: { id: shift.id }, data: { openedAt: new Date(instant) } });
      const filtered = await getShiftReconciliation(dateFilter);
      assert.equal(filtered.count, expectedCount, instant);
      if (expectedCount) assert.equal(filtered.shifts[0].expected, 1200);
    }
    const invalidDates = await getShiftReconciliation({ cashierId: user.id, from: "2026-02-30" });
    assert.ok(invalidDates.error);
    assert.equal(invalidDates.count, 0);
    assert.equal(invalidDates.shifts.length, 0);
    process.env.TEST_STAFF_ID = user.id;
    assert.equal(await serializable(tx => linkActiveShift(tx, user.id)), null);
    assert.ok((await openShift(randomUUID(), 10)).success);
    const active = await prisma.cashShift.findUniqueOrThrow({ where: { activeCashierId: user.id } });
    assert.equal(await serializable(tx => linkActiveShift(tx, user.id)), active.id);
    const [movement, closing] = await Promise.all([
      recordCashMovement(randomUUID(), active.id, "IN", 1, "closing race"),
      closeShift(active.id, 10, "Concurrent movement test"),
    ]);
    assert.ok(closing.success);
    const final = await prisma.cashShift.findUniqueOrThrow({ where: { id: active.id } });
    assert.equal(final.expectedCash, movement.success ? 11 : 10);
  } finally {
    delete process.env.TEST_STAFF_ID;
    await prisma.refund.deleteMany({ where: { processedById: user.id } });
    await prisma.order.deleteMany({ where: { cashierId: user.id } });
    await prisma.cashMovement.deleteMany({ where: { shift: { cashierId: user.id } } });
    await prisma.cashShift.deleteMany({ where: { cashierId: user.id } });
    await prisma.auditLog.deleteMany({ where: { userId: { in: [user.id, other.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, other.id] } } });
    await prisma.$disconnect();
  }
});
