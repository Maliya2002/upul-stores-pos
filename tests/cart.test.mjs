import "./action-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
const { useCartStore } =
  await import("../src/features/pos/store/cart-store.ts");
const product = {
  productId: "p1",
  name: "Rice",
  sku: "rice",
  price: 125.5,
  quantity: 2,
  discount: 10,
  tax: 5,
  maxStock: 4,
};

test("cart totals agree with server rounding and quantities stay within stock", () => {
  useCartStore.getState().clearCart();
  useCartStore.getState().addItem(product);
  assert.equal(useCartStore.getState().getGrandTotal(), 237.2);
  useCartStore.getState().updateQuantity("p1", 1.5);
  assert.equal(useCartStore.getState().items[0].quantity, 2);
  useCartStore.getState().addItem({ ...product, quantity: 10 });
  assert.equal(useCartStore.getState().items[0].quantity, 4);
});
test("changing a cart invalidates its coupon and resuming preserves the active cart", () => {
  useCartStore.getState().clearCart();
  useCartStore.getState().addItem(product);
  useCartStore.getState().setCoupon("SAVE", 20);
  useCartStore.getState().updateQuantity("p1", 3);
  assert.equal(useCartStore.getState().couponCode, "");
  useCartStore.getState().holdOrder();
  const held = useCartStore.getState().heldOrders[0];
  useCartStore.getState().addItem({ ...product, productId: "p2" });
  useCartStore.getState().setCoupon("OTHER", 10);
  useCartStore.getState().resumeOrder(held.id);
  assert.equal(useCartStore.getState().items[0].productId, "p1");
  assert.equal(useCartStore.getState().heldOrders[0].items[0].productId, "p2");
  assert.equal(useCartStore.getState().couponDiscount, 0);
  useCartStore.getState().clearCart();
  useCartStore.setState({ heldOrders: [] });
});
