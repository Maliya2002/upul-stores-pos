import "./action-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
const { allocateNetTotals, quoteReturn } =
  await import("../src/features/sales/utils/returns.ts");

test("coupon allocation preserves the invoice total down to the cent", () => {
  assert.deepEqual(allocateNetTotals([1, 1, 1], 1), [0.34, 0.33, 0.33]);
  assert.deepEqual(allocateNetTotals([0, 0], 0), [0, 0]);
  assert.throws(() => allocateNetTotals([1], 2));
  assert.throws(() => allocateNetTotals([NaN], 1));
});

test("separate partial returns refund exactly the original discounted line total", () => {
  const line = {
    id: "line",
    name: "Item",
    quantity: 3,
    total: 300,
    netTotal: 290,
    refundItems: [],
  };
  const request = [{ orderItemId: "line", quantity: 1, restock: false }];
  const amounts = [];
  for (let i = 0; i < 3; i++) {
    amounts.push(quoteReturn([line], 290, request)[0].amount);
    line.refundItems.push({ quantity: 1 });
  }
  assert.deepEqual(amounts, [96.67, 96.66, 96.67]);
  assert.throws(() => quoteReturn([line], 290, request), /Only 0/);
});

test("return validation rejects duplicates, foreign items and fractional quantities", () => {
  const line = {
    id: "line",
    name: "Item",
    quantity: 3,
    total: 300,
    netTotal: null,
    refundItems: [],
  };
  const request = { orderItemId: "line", quantity: 1, restock: true };
  for (const items of [
    [],
    [request, request],
    [{ ...request, orderItemId: "foreign" }],
    [{ ...request, quantity: 1.5 }],
    [{ ...request, quantity: -1 }],
    [{ ...request, restock: "yes" }],
  ])
    assert.throws(() => quoteReturn([line], 300, items));
  assert.equal(quoteReturn([line], 290, [request])[0].amount, 96.67);
});
