import "./action-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const url = new URL(process.env.DATABASE_URL);
assert.equal(
  url.hostname,
  "127.0.0.1",
  "Integration tests require the local development database",
);
assert.equal(url.port, "55432");
assert.equal(url.pathname, "/upul_pos");
const { default: prisma } = await import("../src/lib/prisma.ts");
const { createOrderAction } =
  await import("../src/features/pos/actions/pos-actions.ts");
const { processRefundAction } =
  await import("../src/features/sales/actions/sales-actions.ts");
const { createPurchaseAction } =
  await import("../src/features/purchases/actions/purchase-actions.ts");
const { stockAdjustAction } =
  await import("../src/features/inventory/actions/inventory-actions.ts");

test("real PostgreSQL: checkout, rollback, concurrent stock/coupons, refunds and access", async (t) => {
  const prefix = "integration-" + randomUUID();
  const user = await prisma.user.create({
    data: {
      name: "Test manager",
      email: prefix + "@example.invalid",
      password: "not-a-login-hash",
      role: "MANAGER",
    },
  });
  const category = await prisma.category.create({
    data: { name: prefix, slug: prefix },
  });
  const customer = await prisma.customer.create({ data: { name: prefix } });
  const supplier = await prisma.supplier.create({
    data: { name: prefix, phone: "test" },
  });
  const product = await prisma.product.create({
    data: {
      name: prefix,
      slug: prefix,
      sku: prefix,
      categoryId: category.id,
      sellingPrice: 100,
      quantity: 5,
      images: [],
    },
  });
  const coupon = await prisma.coupon.create({
    data: {
      code: prefix.toUpperCase(),
      discountType: "fixed",
      discountValue: 10,
      usageLimit: 1,
    },
  });
  process.env.TEST_STAFF_ID = user.id;
  const input = (overrides = {}) => ({
    requestKey: randomUUID(),
    items: [
      {
        productId: product.id,
        quantity: 1,
        discount: 0,
        price: 0.01,
        tax: 0,
        name: "forged",
        sku: "forged",
        total: 0.01,
        maxStock: 999,
      },
    ],
    cashierId: "forged",
    customerId: customer.id,
    paymentMethod: "CASH",
    paidAmount: 100,
    couponCode: "",
    couponDiscount: 999,
    note: prefix,
    ...overrides,
  });
  try {
    let orderId;
    let orderItemId;
    await t.test(
      "catalog prices and session identity override forged client values",
      async () => {
        const result = await createOrderAction(input({ paidAmount: 150 }));
        assert.equal(result.success, true, result.error);
        orderId = result.orderId;
        const order = await prisma.order.findUniqueOrThrow({
          where: { id: orderId },
          include: { items: true, payments: true },
        });
        assert.equal(order.total, 100);
        assert.equal(order.cashierId, user.id);
        assert.equal(order.changeAmount, 50);
        assert.equal(order.payments[0].amount, 100);
        assert.equal(order.items[0].name, product.name);
        orderItemId = order.items[0].id;
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          4,
        );
      },
    );
    await t.test(
      "underpayment rolls back both stock and coupon usage",
      async () => {
        const result = await createOrderAction(
          input({ couponCode: coupon.code, paidAmount: 1 }),
        );
        assert.equal(result.success, false);
        assert.equal(
          (await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } }))
            .usedCount,
          0,
        );
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          4,
        );
      },
    );
    await t.test("one-use coupon cannot be spent concurrently", async () => {
      const results = await Promise.all([
        createOrderAction(input({ couponCode: coupon.code, paidAmount: 90 })),
        createOrderAction(input({ couponCode: coupon.code, paidAmount: 90 })),
      ]);
      assert.equal(results.filter((result) => result.success).length, 1);
      assert.equal(
        (await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } }))
          .usedCount,
        1,
      );
    });
    await t.test("two checkouts cannot sell the last unit twice", async () => {
      await prisma.product.update({
        where: { id: product.id },
        data: { quantity: 1 },
      });
      const results = await Promise.all([
        createOrderAction(input()),
        createOrderAction(input()),
      ]);
      assert.equal(results.filter((result) => result.success).length, 1);
      assert.equal(
        (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
          .quantity,
        0,
      );
    });
    await t.test(
      "refund validation and concurrent refund restore stock once",
      async () => {
        assert.equal(
          (
            await processRefundAction({
              requestKey: randomUUID(),
              orderId,
              reason: "Invalid",
              method: "CASH",
              items: [{ orderItemId, quantity: -1, restock: true }],
            })
          ).success,
          false,
        );
        assert.equal(
          (
            await processRefundAction({
              requestKey: randomUUID(),
              orderId,
              reason: "Too much",
              method: "CASH",
              items: [{ orderItemId, quantity: 2, restock: true }],
            })
          ).success,
          false,
        );
        const results = await Promise.all([
          processRefundAction({
            requestKey: randomUUID(),
            orderId,
            reason: "Return",
            method: "CASH",
            items: [{ orderItemId, quantity: 1, restock: true }],
          }),
          processRefundAction({
            requestKey: randomUUID(),
            orderId,
            reason: "Return",
            method: "CASH",
            items: [{ orderItemId, quantity: 1, restock: true }],
          }),
        ]);
        assert.equal(results.filter((result) => result.success).length, 1);
        assert.equal(await prisma.refund.count({ where: { orderId } }), 1);
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          1,
        );
        assert.equal(
          (
            await processRefundAction({
              requestKey: randomUUID(),
              orderId,
              reason: "Again",
              method: "CASH",
              items: [{ orderItemId, quantity: 1, restock: true }],
            })
          ).success,
          false,
        );
      },
    );
    await t.test(
      "purchases add stock using canonical product names and reject duplicates",
      async () => {
        const data = {
          supplierId: supplier.id,
          paymentMethod: "CASH",
          notes: prefix,
          items: [
            {
              productId: product.id,
              name: "forged",
              quantity: 2,
              unitCost: 60,
            },
          ],
        };
        const result = await createPurchaseAction(data);
        assert.equal(result.success, true, result.error);
        const purchase = await prisma.purchase.findUniqueOrThrow({
          where: { id: result.purchaseId },
          include: { items: true },
        });
        assert.equal(purchase.total, 120);
        assert.equal(purchase.items[0].name, product.name);
        assert.equal(
          (
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            })
          ).quantity,
          3,
        );
        assert.equal(
          (
            await createPurchaseAction({
              ...data,
              items: [data.items[0], data.items[0]],
            })
          ).success,
          false,
        );
      },
    );
    await t.test(
      "invalid adjustments fail and cashiers cannot purchase or refund",
      async () => {
        assert.equal((await stockAdjustAction(product.id, -1)).success, false);
        assert.equal((await stockAdjustAction(product.id, 1.5)).success, false);
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "CASHIER" },
        });
        assert.equal(
          (
            await processRefundAction({
              requestKey: randomUUID(),
              orderId,
              reason: "Unauthorized",
              method: "CASH",
              items: [{ orderItemId, quantity: 1, restock: true }],
            })
          ).success,
          false,
        );
        await assert.rejects(
          createPurchaseAction({
            supplierId: supplier.id,
            paymentMethod: "CASH",
            notes: "",
            items: [],
          }),
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "MANAGER" },
        });
      },
    );
    await t.test("signed-out and deactivated staff cannot sell", async () => {
      delete process.env.TEST_STAFF_ID;
      assert.equal((await createOrderAction(input())).success, false);
      process.env.TEST_STAFF_ID = user.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });
      assert.equal((await createOrderAction(input())).success, false);
    });
  } finally {
    // Delete only this run's generated fixtures; never reset the development database.
    const ids = (
      await prisma.order.findMany({
        where: { cashierId: user.id },
        select: { id: true },
      })
    ).map((order) => order.id);
    await prisma.refund.deleteMany({ where: { orderId: { in: ids } } });
    await prisma.order.deleteMany({ where: { id: { in: ids } } });
    await prisma.purchase.deleteMany({ where: { supplierId: supplier.id } });
    await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.supplier.delete({ where: { id: supplier.id } });
    await prisma.coupon.delete({ where: { id: coupon.id } });
    await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    delete process.env.TEST_STAFF_ID;
    await prisma.$disconnect();
  }
});
