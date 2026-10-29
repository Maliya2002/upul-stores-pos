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
const { stockAdjustAction: adjustRaw, stockInAction: inRaw, stockOutAction: outRaw } =
  await import("../src/features/inventory/actions/inventory-actions.ts");

const stockInAction = data => inRaw(data, randomUUID());
const stockOutAction = data => outRaw(data, randomUUID());
const stockAdjustAction = (id, qty, notes, expected) => adjustRaw(id, qty, notes, expected, randomUUID());

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
          requestKey: randomUUID(),
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
        const firstAttempts = await Promise.all([createPurchaseAction(data), createPurchaseAction(data)]);
        const result = firstAttempts[0];
        assert.ok(firstAttempts.every(r => r.success && r.purchaseId === result.purchaseId));
        assert.equal(result.success, true, result.error);
        const purchase = await prisma.purchase.findUniqueOrThrow({
          where: { id: result.purchaseId },
          include: { items: true },
        });
        const replay = await Promise.all([createPurchaseAction(data), createPurchaseAction(data)]);
        assert.ok(replay.every(r => r.success && r.purchaseId === purchase.id));
        assert.equal((await createPurchaseAction({ ...data, notes: "changed" })).success, false);
        assert.equal(await prisma.auditLog.count({ where: { entityId: purchase.id, action: "PURCHASE_RECEIVED" } }), 1);
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
    await t.test("manual stock changes require reasons, valid directions and fresh counts", async () => {
      const before = (await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity;
      const data = { productId: product.id, type: "ADJUSTMENT", quantity: 2, reference: prefix, notes: "Verified count correction" };
      assert.equal((await stockInAction({ ...data, notes: " " })).success, false);
      assert.equal((await stockInAction({ ...data, type: "DAMAGED" })).success, false);
      assert.equal((await stockOutAction({ ...data, type: "SALE" })).success, false);
      assert.equal((await stockInAction({ ...data, quantity: 1.5 })).success, false);
      assert.equal((await stockInAction(data)).success, true);
      assert.equal((await stockAdjustAction(product.id, before, "Count", before)).success, false);
      assert.equal((await stockOutAction({ ...data, quantity: before + 3 })).success, false);
      assert.equal((await stockOutAction({ ...data, type: "DAMAGED" })).success, true);
      assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity, before);
      const logs = await prisma.auditLog.findMany({ where: { userId: user.id, action: "STOCK_ADJUSTED" } });
      assert.equal(logs.length, 2);
      assert.equal(JSON.parse(logs[0].newValues).reason, data.notes);
      const requestKey = randomUUID();
      const repeats = await Promise.all([inRaw(data, requestKey), inRaw(data, requestKey)]);
      assert.ok(repeats.every(r => r.success && r.movementId === repeats[0].movementId));
      assert.equal(await prisma.stockMovement.count({ where: { requestKey } }), 1);
      assert.equal(await prisma.auditLog.count({ where: { entityId: repeats[0].movementId } }), 1);
      assert.equal((await inRaw({ ...data, quantity: 3 }, requestKey)).success, false);
      assert.equal((await outRaw(data, requestKey)).success, false);
      assert.equal((await inRaw(data)).success, false);
      assert.equal((await stockOutAction(data)).success, true);
      const countKey = randomUUID();
      assert.equal((await adjustRaw(product.id, before, "Count unchanged", before, countKey)).success, true);
      assert.equal((await stockInAction(data)).success, true);
      assert.equal((await adjustRaw(product.id, before, "Count unchanged", before, countKey)).success, true);
      assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity, before + 2);
      assert.equal((await stockOutAction(data)).success, true);

      const competing = await Promise.all([stockOutAction({ ...data, quantity: before }), stockOutAction({ ...data, quantity: before })]);
      assert.equal(competing.filter(r => r.success).length, 1);
      assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity, 0);
      assert.equal((await stockInAction({ ...data, quantity: before })).success, true);

      await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });
      assert.equal((await stockInAction(data)).success, false);
      assert.equal((await stockOutAction(data)).success, false);
      await prisma.product.update({ where: { id: product.id }, data: { isActive: true } });
      assert.equal((await stockAdjustAction(product.id, before + 1, "Physical recount", before)).success, true);
      assert.equal((await stockAdjustAction(product.id, before, "Restore", before + 1)).success, true);
      await prisma.user.update({ where: { id: user.id }, data: { role: "CASHIER" } });
      await assert.rejects(stockInAction(data));
      await assert.rejects(stockOutAction(data));
      await prisma.user.update({ where: { id: user.id }, data: { role: "MANAGER" } });
    });
    await t.test("supplier credit and payments stay consistent under retries and competing payments", async () => {
      const { addSupplierPaymentAction } = await import("../src/features/suppliers/actions/supplier-actions.ts");
      const creditInput = { requestKey: randomUUID(), supplierId: supplier.id, paymentMethod: "CASH", paidAmount: 0, notes: prefix, items: [{ productId: product.id, name: product.name, quantity: 1, unitCost: 10 }] };
      assert.equal((await createPurchaseAction({ ...creditInput, paidAmount: 11 })).success, false);
      const credit = await createPurchaseAction(creditInput);
      assert.equal(credit.success, true);
      assert.equal((await prisma.purchase.findUniqueOrThrow({ where: { id: credit.purchaseId } })).paymentStatus, "PENDING");
      assert.equal((await addSupplierPaymentAction({ requestKey: randomUUID(), purchaseId: credit.purchaseId, supplierId: supplier.id, amount: 10, method: "CASH", reference: prefix, notes: "settle credit" })).success, true);
      const result = await createPurchaseAction({ requestKey: randomUUID(), supplierId: supplier.id, paymentMethod: "CASH", paidAmount: 20, notes: prefix,
        items: [{ productId: product.id, name: product.name, quantity: 1, unitCost: 100 }] });
      assert.equal(result.success, true, result.error);
      const purchase = await prisma.purchase.findUniqueOrThrow({ where: { id: result.purchaseId } });
      assert.equal(purchase.paidAmount, 20); assert.equal(purchase.paymentStatus, "PARTIAL");
      assert.equal((await prisma.supplier.findUniqueOrThrow({ where: { id: supplier.id } })).balance, 80);
      const payload = { requestKey: randomUUID(), purchaseId: purchase.id, supplierId: supplier.id, amount: 30, method: "BANK_TRANSFER", reference: prefix, notes: "test" };
      const repeat = await Promise.all([addSupplierPaymentAction(payload), addSupplierPaymentAction(payload)]);
      assert.ok(repeat.every(r => r.success && r.paymentId === repeat[0].paymentId));
      assert.equal((await addSupplierPaymentAction({ ...payload, amount: 31 })).success, false);
      const competing = await Promise.all([addSupplierPaymentAction({ ...payload, requestKey: randomUUID(), amount: 50 }), addSupplierPaymentAction({ ...payload, requestKey: randomUUID(), amount: 50 })]);
      assert.equal(competing.filter(r => r.success).length, 1);
      const paid = await prisma.purchase.findUniqueOrThrow({ where: { id: purchase.id } });
      assert.equal(paid.paidAmount, 100); assert.equal(paid.paymentStatus, "PAID");
      assert.equal((await prisma.supplier.findUniqueOrThrow({ where: { id: supplier.id } })).balance, 0);
      assert.equal(await prisma.supplierPayment.count({ where: { purchaseId: purchase.id } }), 3);
      assert.equal(await prisma.auditLog.count({ where: { userId: user.id, action: "SUPPLIER_PAYMENT" } }), 3);
      assert.equal((await addSupplierPaymentAction({ ...payload, requestKey: randomUUID(), amount: 0.001 })).success, false);
      await prisma.user.update({ where: { id: user.id }, data: { role: "CASHIER" } });
      await assert.rejects(addSupplierPaymentAction(payload));
      await prisma.user.update({ where: { id: user.id }, data: { role: "MANAGER" } });
    });
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
            requestKey: randomUUID(),
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
    await prisma.supplierPayment.deleteMany({ where: { supplierId: supplier.id } });
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
