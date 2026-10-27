import { CheckoutError } from "@/features/pos/utils/checkout";

export interface RefundRequest {
  requestKey: string;
  orderId: string;
  reason: string;
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "QR";
  items: { orderItemId: string; quantity: number; restock: boolean }[];
}

export interface ReturnLine {
  id: string;
  name: string;
  quantity: number;
  total: number;
  netTotal: number | null;
  refundItems: { quantity: number }[];
}

// Allocate in integer cents; the largest remainders get the remaining cents.
// This also gives old invoices an exact allocation without using current prices.
export function allocateNetTotals(
  totals: number[],
  orderTotal: number,
): number[] {
  const cents = Math.round(orderTotal * 100);
  const weights = totals.map((value) => Math.round(value * 100));
  const sum = weights.reduce((a, b) => a + b, 0);
  if (
    !Number.isSafeInteger(cents) ||
    !Number.isSafeInteger(sum) ||
    cents < 0 ||
    weights.some((value) => !Number.isSafeInteger(value) || value < 0) ||
    cents > sum
  )
    throw new CheckoutError(
      "Invoice totals need reconciliation before returning items.",
    );
  if (sum === 0) return totals.map(() => 0);
  const shares = weights.map((weight, index) => ({
    index,
    cents: Number((BigInt(cents) * BigInt(weight)) / BigInt(sum)),
    remainder: Number((BigInt(cents) * BigInt(weight)) % BigInt(sum)),
  }));
  let remaining =
    cents - shares.reduce((total, share) => total + share.cents, 0);
  for (const share of [...shares].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  )) {
    if (remaining-- > 0) share.cents++;
  }
  return shares.map((share) => share.cents / 100);
}

export function quoteReturn(
  lines: ReturnLine[],
  total: number,
  requested: { orderItemId: string; quantity: number; restock: boolean }[],
) {
  if (
    !Array.isArray(requested) ||
    requested.length === 0 ||
    requested.length > lines.length
  )
    throw new CheckoutError("Select at least one item to return.");
  const allocations = allocateNetTotals(
    lines.map((line) => line.total),
    total,
  );
  const seen = new Set<string>();
  return requested.map((request) => {
    if (
      !request ||
      seen.has(request.orderItemId) ||
      !Number.isSafeInteger(request.quantity) ||
      request.quantity <= 0 ||
      typeof request.restock !== "boolean"
    )
      throw new CheckoutError(
        "Return quantities must be positive whole numbers with no duplicate items.",
      );
    seen.add(request.orderItemId);
    const index = lines.findIndex((line) => line.id === request.orderItemId);
    if (index < 0)
      throw new CheckoutError("This item does not belong to the invoice.");
    const line = lines[index];
    const returned = line.refundItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (request.quantity > line.quantity - returned)
      throw new CheckoutError(
        `Only ${line.quantity - returned} units of ${line.name} can be returned.`,
      );
    const cents = Math.round((line.netTotal ?? allocations[index]) * 100);
    if (
      !Number.isSafeInteger(cents) ||
      cents < 0 ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity <= 0
    )
      throw new CheckoutError(
        "Invoice line needs reconciliation before returning items.",
      );
    const cumulative = (quantity: number) =>
      Number(
        (BigInt(cents) * BigInt(quantity) * BigInt(2) + BigInt(line.quantity)) /
          (BigInt(line.quantity) * BigInt(2)),
      );
    const amount =
      (cumulative(returned + request.quantity) - cumulative(returned)) / 100;
    return {
      orderItemId: request.orderItemId,
      quantity: request.quantity,
      restock: request.restock,
      amount,
    };
  });
}
