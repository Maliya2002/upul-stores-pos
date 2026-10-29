import "./action-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const url = new URL(process.env.DATABASE_URL);
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "55432");
assert.equal(url.pathname, "/upul_pos");
const { default: prisma } = await import("../src/lib/prisma.ts");
const { createOrderAction } =
  await import("../src/features/pos/actions/pos-actions.ts");
const { processRefundAction } =
  await import("../src/features/sales/actions/sales-actions.ts");
const { netSalesSince } =
  await import("../src/features/sales/utils/net-sales.ts");

test("durable checkout and item-return transactions", async (t) => {
  const prefix = `reliability-${randomUUID()}`;
  const user = await prisma.user.create({
    data: {
      name: prefix,
      email: `${prefix}@example.invalid`,
      password: "not-login",
      role: "MANAGER",
    },
  });
  const other = await prisma.user.create({
    data: {
      name: prefix,
      email: `other-${prefix}@example.invalid`,
      password: "not-login",
      role: "CASHIER",
    },
  });
  const category = await prisma.category.create({
    data: { name: prefix, slug: prefix },
  });
  const product = await prisma.product.create({
    data: {
      name: prefix,
      slug: prefix,
      sku: prefix,
      categoryId: category.id,
      sellingPrice: 100,
      purchasePrice: 40,
      quantity: 30,
      images: [],
    },
  });
  const customer = await prisma.customer.create({ data: { name: prefix } });
  const coupon = await prisma.coupon.create({
    data: {
      code: prefix.toUpperCase(),
      discountType: "fixed",
      discountValue: 10,
      usageLimit: 10,
    },
  });
  const input = () => ({
    requestKey: randomUUID(),
    items: [
      {
        productId: product.id,
        quantity: 3,
        discount: 0,
        name: prefix,
        sku: prefix,
        price: 100,
        tax: 0,
        total: 300,
        maxStock: 30,
      },
    ],
    customerId: customer.id,
    cashierId: "forged",
    paymentMethod: "CASH",
    paidAmount: 300,
    couponCode: coupon.code,
    couponDiscount: 10,
    note: prefix,
  });
  process.env.TEST_STAFF_ID = user.id;
  let order;
  try {
    const reportingStart = new Date("2000-01-01T00:00:00Z");
    const reportingBaseline = await netSalesSince(reportingStart);
    await t.test(
      "concurrent identical requests return one invoice with one stock/payment/coupon/audit effect",
      async () => {
        const request = input();
        const results = await Promise.all([
          createOrderAction(request),
          createOrderAction(request),
        ]);
        assert.ok(
          results.every((result) => result.success),
          JSON.stringify(results),
        );
        assert.equal(results[0].orderId, results[1].orderId);
        order = await prisma.order.findUniqueOrThrow({
          where: { id: results[0].orderId },
          include: { items: true, payments: true },
        });
        assert.equal(order.total, 290);
        assert.equal(order.items[0].netTotal, 290);
        assert.equal(order.items[0].unitCost, 40);
        assert.equal(order.payments.length, 1);
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          27,
        );
        assert.equal(
          (await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } }))
            .usedCount,
          1,
        );
        assert.equal(
          (
            await prisma.customer.findUniqueOrThrow({
              where: { id: customer.id },
            })
          ).totalOrders,
          1,
        );
        assert.equal(
          await prisma.auditLog.count({ where: { entityId: order.id } }),
          1,
        );
        assert.equal(
          (await createOrderAction({ ...request, paidAmount: 400 })).success,
          false,
        );
        process.env.TEST_STAFF_ID = other.id;
        assert.equal((await createOrderAction(request)).success, false);
        process.env.TEST_STAFF_ID = user.id;
        // Replaying after catalog changes must still return the original invoice.
        await prisma.product.update({
          where: { id: product.id },
          data: { sellingPrice: 125, purchasePrice: 80 },
        });
        assert.equal((await createOrderAction(request)).total, 290);
      },
    );
    const returnRequest = (quantity = 1, restock = false) => ({
      requestKey: randomUUID(),
      orderId: order.id,
      reason: "Customer return",
      method: "CASH",
      items: [{ orderItemId: order.items[0].id, quantity, restock }],
    });
    await t.test(
      "partial damaged return is idempotent and does not restock",
      async () => {
        const request = returnRequest();
        const results = await Promise.all([
          processRefundAction(request),
          processRefundAction(request),
        ]);
        assert.ok(
          results.every((result) => result.success),
          JSON.stringify(results),
        );
        assert.equal(results[0].refundId, results[1].refundId);
        assert.equal(results[0].amount, 96.67);
        assert.equal(
          Math.round(
            ((await netSalesSince(reportingStart)).revenue -
              reportingBaseline.revenue) *
              100,
          ),
          19333,
        );
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          27,
        );
        assert.equal(
          (await processRefundAction({ ...request, reason: "Changed" }))
            .success,
          false,
        );
        assert.equal(
          (await prisma.order.findUniqueOrThrow({ where: { id: order.id } }))
            .orderStatus,
          "COMPLETED",
        );
        assert.equal(
          await prisma.auditLog.count({
            where: { entityId: results[0].refundId },
          }),
          1,
        );
      },
    );
    await t.test(
      "over-return and foreign line requests roll back; valid partial restock records exact cents",
      async () => {
        assert.equal(
          (await processRefundAction(returnRequest(3, true))).success,
          false,
        );
        assert.equal(
          (
            await processRefundAction({
              ...returnRequest(),
              items: [{ orderItemId: "foreign", quantity: 1, restock: true }],
            })
          ).success,
          false,
        );
        const result = await processRefundAction(returnRequest(1, true));
        assert.equal(result.success, true, result.error);
        assert.equal(result.amount, 96.66);
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          28,
        );
      },
    );
    await t.test(
      "two different returns cannot consume the same final unit",
      async () => {
        const request = returnRequest(1, true);
        const results = await Promise.all([
          processRefundAction(request),
          processRefundAction(returnRequest(1, true)),
        ]);
        assert.equal(results.filter((result) => result.success).length, 1);
        const final = await prisma.order.findUniqueOrThrow({
          where: { id: order.id },
          include: { refunds: true },
        });
        assert.equal(final.orderStatus, "REFUNDED");
        assert.equal(
          (await netSalesSince(reportingStart)).revenue,
          reportingBaseline.revenue,
        );
        assert.equal(
          Math.round(
            final.refunds.reduce((sum, refund) => sum + refund.amount, 0) * 100,
          ),
          29000,
        );
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          29,
        );
        assert.equal(
          (
            await prisma.customer.findUniqueOrThrow({
              where: { id: customer.id },
            })
          ).loyaltyPoints,
          0,
        );
      },
    );
    await t.test(
      "legacy amount-only refunds require reconciliation",
      async () => {
        const request = input();
        request.items[0].quantity = 1;
        request.paidAmount = 125;
        const result = await createOrderAction(request);
        assert.equal(result.success, true, result.error);
        const legacy = await prisma.order.findUniqueOrThrow({
          where: { id: result.orderId },
          include: { items: true },
        });
        await prisma.refund.create({
          data: { orderId: legacy.id, amount: 1, reason: "legacy" },
        });
        const returned = await processRefundAction({
          ...returnRequest(),
          orderId: legacy.id,
          items: [
            { orderItemId: legacy.items[0].id, quantity: 1, restock: true },
          ],
        });
        assert.equal(returned.success, false);
        assert.match(returned.error, /older amount-only/);
      },
    );
    await t.test("cashiers cannot return items", async () => {
      process.env.TEST_STAFF_ID = other.id;
      assert.equal((await processRefundAction(returnRequest())).success, false);
    });
  } finally {
    const orders = await prisma.order.findMany({
      where: { cashierId: user.id },
      select: { id: true },
    });
    await prisma.refund.deleteMany({
      where: { orderId: { in: orders.map((order) => order.id) } },
    });
    await prisma.order.deleteMany({ where: { cashierId: user.id } });
    await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.coupon.delete({ where: { id: coupon.id } });
    await prisma.auditLog.deleteMany({
      where: { userId: { in: [user.id, other.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [user.id, other.id] } },
    });
    delete process.env.TEST_STAFF_ID;
    await prisma.$disconnect();
  }
});
