export class CheckoutError extends Error {}

export const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export interface CheckoutProduct {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  discount: number;
  tax: number;
  quantity: number;
  isActive: boolean;
  status: string;
}

export function priceCheckout(
  requested: { productId: string; quantity: number; discount: number }[],
  products: CheckoutProduct[],
  canDiscount: boolean,
) {
  if (
    !Array.isArray(requested) ||
    requested.length === 0 ||
    requested.length > 500
  ) {
    throw new CheckoutError("Cart must contain between 1 and 500 items.");
  }
  const seen = new Set<string>();
  const items = requested.map((item) => {
    if (!item || !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new CheckoutError("Quantities must be positive whole numbers.");
    }
    if (seen.has(item.productId))
      throw new CheckoutError("Duplicate cart product.");
    seen.add(item.productId);
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.isActive || product.status !== "ACTIVE") {
      throw new CheckoutError(
        "A product is no longer available. Refresh the cart.",
      );
    }
    if (item.quantity > product.quantity) {
      throw new CheckoutError(
        `Not enough stock for ${product.name}. Available: ${product.quantity}`,
      );
    }
    if (
      !Number.isFinite(product.sellingPrice) ||
      product.sellingPrice < 0 ||
      !Number.isFinite(product.tax) ||
      product.tax < 0
    ) {
      throw new CheckoutError(
        "Product pricing is invalid. Ask a manager to update it.",
      );
    }
    if (
      !Number.isFinite(item.discount) ||
      item.discount < 0 ||
      item.discount > 100
    ) {
      throw new CheckoutError("Discount must be between 0 and 100 percent.");
    }
    if (!canDiscount && item.discount !== product.discount) {
      throw new CheckoutError(
        "A manager must approve changes to product discounts.",
      );
    }
    const discount = canDiscount ? item.discount : product.discount;
    const base = money(product.sellingPrice * item.quantity);
    const discountAmount = money((base * discount) / 100);
    const taxAmount = money(((base - discountAmount) * product.tax) / 100);
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice: product.sellingPrice,
      discount,
      tax: product.tax,
      total: money(base - discountAmount + taxAmount),
      base,
      discountAmount,
      taxAmount,
    };
  });
  return {
    items,
    subtotal: money(items.reduce((sum, item) => sum + item.base, 0)),
    itemDiscount: money(
      items.reduce((sum, item) => sum + item.discountAmount, 0),
    ),
    taxAmount: money(items.reduce((sum, item) => sum + item.taxAmount, 0)),
  };
}

export function couponAmount(
  coupon: {
    isActive: boolean;
    expiresAt: Date | null;
    usageLimit: number | null;
    usedCount: number;
    minimumAmount: number | null;
    discountType: string;
    discountValue: number;
  },
  subtotal: number,
  maximum = subtotal,
) {
  if (!Number.isFinite(subtotal) || subtotal < 0)
    throw new CheckoutError("Invalid subtotal.");
  if (!coupon.isActive) throw new CheckoutError("Coupon is inactive.");
  if (coupon.expiresAt && coupon.expiresAt <= new Date())
    throw new CheckoutError("Coupon has expired.");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    throw new CheckoutError("Coupon usage limit reached.");
  if (coupon.minimumAmount !== null && subtotal < coupon.minimumAmount)
    throw new CheckoutError(
      `Minimum order Rs.${coupon.minimumAmount} required.`,
    );
  if (
    !Number.isFinite(coupon.discountValue) ||
    coupon.discountValue < 0 ||
    !["percentage", "fixed"].includes(coupon.discountType)
  )
    throw new CheckoutError("Invalid coupon configuration.");
  const value =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  return money(Math.min(value, maximum));
}

export function validatePayment(method: string, paid: number, total: number) {
  if (!["CASH", "CARD", "BANK_TRANSFER", "QR"].includes(method))
    throw new CheckoutError("Unsupported payment method.");
  if (!Number.isFinite(paid) || paid < 0 || money(paid) < total)
    throw new CheckoutError(
      "Insufficient payment. Refresh the cart if prices have changed.",
    );
  if (method !== "CASH" && money(paid) !== total)
    throw new CheckoutError("Non-cash payment must match the order total.");
  return method === "CASH" ? money(paid - total) : 0;
}
