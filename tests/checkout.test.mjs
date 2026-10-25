import test from "node:test";
import assert from "node:assert/strict";
import {
  priceCheckout,
  couponAmount,
  validatePayment,
} from "../src/features/pos/utils/checkout.ts";

const product = {
  id: "p1",
  name: "Rice",
  sku: "RICE",
  sellingPrice: 125.5,
  discount: 10,
  tax: 5,
  quantity: 4,
  isActive: true,
  status: "ACTIVE",
};
const item = {
  productId: "p1",
  quantity: 2,
  discount: 10,
  price: 0.01,
  total: 0.02,
};
const coupon = {
  isActive: true,
  expiresAt: null,
  usageLimit: null,
  usedCount: 0,
  minimumAmount: null,
  discountType: "percentage",
  discountValue: 10,
};

test("checkout ignores forged browser price and total", () => {
  const result = priceCheckout([item], [product], false);
  assert.equal(result.subtotal, 251);
  assert.equal(result.itemDiscount, 25.1);
  assert.equal(result.taxAmount, 11.3);
  assert.equal(result.items[0].total, 237.2);
});
test("invalid and fractional quantities cannot create stock", () => {
  for (const quantity of [-1, 0, 1.5, NaN, Infinity])
    assert.throws(() =>
      priceCheckout([{ ...item, quantity }], [product], false),
    );
});
test("overselling and duplicate product entries are rejected", () => {
  assert.throws(() =>
    priceCheckout([{ ...item, quantity: 5 }], [product], false),
  );
  assert.throws(() => priceCheckout([item, item], [product], false));
});
test("inactive and missing products cannot be sold", () => {
  assert.throws(() =>
    priceCheckout([item], [{ ...product, isActive: false }], false),
  );
  assert.throws(() => priceCheckout([item], [], false));
});
test("only managers can change catalog discounts", () => {
  assert.throws(() =>
    priceCheckout([{ ...item, discount: 100 }], [product], false),
  );
  assert.equal(
    priceCheckout([{ ...item, discount: 100 }], [product], true).items[0].total,
    0,
  );
  assert.throws(() =>
    priceCheckout([{ ...item, discount: 101 }], [product], true),
  );
});
test("expired, exhausted, inactive and below-minimum coupons fail", () => {
  for (const override of [
    { expiresAt: new Date(0) },
    { usageLimit: 0 },
    { usageLimit: 1, usedCount: 1 },
    { isActive: false },
    { minimumAmount: 101 },
  ]) {
    assert.throws(() => couponAmount({ ...coupon, ...override }, 100));
  }
});
test("coupon cannot discount more than the remaining merchandise value", () => {
  assert.equal(couponAmount(coupon, 100), 10);
  assert.equal(
    couponAmount(
      { ...coupon, discountType: "fixed", discountValue: 500 },
      100,
      80,
    ),
    80,
  );
});
test("payments reject underpayment, invalid numbers and unsupported tenders", () => {
  for (const paid of [-1, NaN, Infinity, 99])
    assert.throws(() => validatePayment("CASH", paid, 100));
  assert.throws(() => validatePayment("GIFT_CARD", 100, 100));
  assert.throws(() => validatePayment("CARD", 101, 100));
});
test("cash change is rounded and card payments match the amount due", () => {
  assert.equal(validatePayment("CASH", 300, 237.2), 62.8);
  assert.equal(validatePayment("CARD", 237.2, 237.2), 0);
});
