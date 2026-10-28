import "./action-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const url = new URL(process.env.DATABASE_URL);
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "55432");
assert.equal(url.pathname, "/upul_pos");
const { default: prisma } = await import("../src/lib/prisma.ts");
const { periodTrading } = await import("../src/features/reports/trading.ts");
const { getDashboardReport } = await import("../src/features/reports/actions/report-actions.ts");

test("reports use transaction dates, saved costs, paid dates and authorized staff", async () => {
  const prefix = `report-${randomUUID()}`;
  const user = await prisma.user.create({ data: { name: prefix, email: `${prefix}@example.invalid`, password: "not-login", role: "CASHIER" } });
  const rollback = new Error("rollback fixtures");
  try {
    process.env.TEST_STAFF_ID = user.id;
    await assert.rejects(getDashboardReport());
    await prisma.user.update({ where: { id: user.id }, data: { role: "MANAGER" } });
    assert.equal((await getDashboardReport()).monthlySales.length, 6);
    await assert.rejects(prisma.$transaction(async tx => {
      const start = new Date("2047-10-27T18:30:00Z"), end = new Date("2047-10-28T18:30:00Z");
      const nextEnd = new Date("2047-10-29T18:30:00Z");
      const before = await periodTrading(tx, start, end);
      const nextBefore = await periodTrading(tx, end, nextEnd);
      const category = await tx.category.create({ data: { name: prefix, slug: prefix } });
      const product = await tx.product.create({ data: { name: prefix, slug: prefix, sku: prefix, categoryId: category.id, purchasePrice: 999, images: [] } });
      const sale = await tx.order.create({ data: { cashierId: user.id, orderNumber: prefix, subtotal: 120, total: 108, orderStatus: "REFUNDED", createdAt: start,
        items: { create: { productId: product.id, name: prefix, sku: prefix, quantity: 2, unitPrice: 60, total: 120, netTotal: 108, unitCost: 30, tax: 8 } } }, include: { items: true } });
      await tx.order.create({ data: { cashierId: user.id, orderNumber: prefix + "cancelled", subtotal: 999, total: 999, orderStatus: "CANCELLED", createdAt: start } });
      await tx.expense.create({ data: { title: prefix, amount: 10, category: "OTHER", paidAt: start, createdAt: end } });
      await tx.refund.create({ data: { orderId: sale.id, amount: 54, createdAt: end,
        items: { create: { orderItemId: sale.items[0].id, quantity: 1, restock: true, amount: 54 } } } });
      const result = await periodTrading(tx, start, end);
      assert.equal(result.revenue - before.revenue, 108);
      assert.equal(result.expenses - before.expenses, 10);
      assert.equal(result.orders - before.orders, 1);
      assert.equal(result.profit - before.profit, 30);
      const returned = await periodTrading(tx, end, nextEnd);
      assert.equal(returned.revenue - nextBefore.revenue, -54);
      assert.equal(returned.profit - nextBefore.profit, -20);
      await tx.orderItem.update({ where: { id: sale.items[0].id }, data: { unitCost: null } });
      assert.equal((await periodTrading(tx, start, end)).profit, null);
      assert.equal((await periodTrading(tx, end, nextEnd)).profit, null);
      throw rollback;
    }, { timeout: 30000 }), error => error === rollback);
  } finally {
    delete process.env.TEST_STAFF_ID;
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
});
