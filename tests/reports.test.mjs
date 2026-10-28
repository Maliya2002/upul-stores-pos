import test from "node:test";
import assert from "node:assert/strict";
import { reportPeriods, summarizeTrading } from "../src/features/reports/trading.ts";
const line = { quantity: 2, unitCost: 30, netTotal: 108, tax: 8 };
const sale = { total: 108, items: [line] };
const refund = (restock) => ({ amount: 54, items: [{ quantity: 1, restock, amount: 54, orderItem: line }] });

test("discounted invoice totals, saved costs and tax drive profit", () => {
  const result = summarizeTrading([sale], [], 10);
  assert.equal(result.revenue, 108);
  assert.equal(result.cost, 60);
  assert.equal(result.profit, 30);
});
test("restocked returns reverse cost; damaged returns retain cost", () => {
  assert.equal(summarizeTrading([sale], [refund(true)], 10).profit, 10);
  assert.equal(summarizeTrading([sale], [refund(false)], 10).profit, -20);
  assert.equal(summarizeTrading([], [refund(true)], 0).profit, -20);
  assert.equal(summarizeTrading([], [refund(true)], 0).revenue, -54);
});
test("legacy costs and amount-only returns suppress profit, not receipt totals", () => {
  assert.equal(summarizeTrading([{ total: 108, items: [{ ...line, unitCost: null }] }], [], 0).profit, null);
  assert.equal(summarizeTrading([sale], [{ amount: 54, items: [] }], 0).profit, null);
  assert.equal(summarizeTrading([sale], [{ amount: 54, items: [] }], 0).revenue, 54);
  assert.equal(summarizeTrading([{ ...sale, total: 100 }], [], 0).profit, null);
  assert.equal(summarizeTrading([], [], 10).profit, -10);
});
test("Colombo date boundaries and month ends are host-timezone independent", () => {
  const periods = reportPeriods(new Date("2026-12-31T18:30:00Z"));
  assert.equal(periods.today.toISOString(), "2026-12-31T18:30:00.000Z");
  assert.equal(periods.year.toISOString(), "2026-12-31T18:30:00.000Z");
  assert.equal(periods.week.toISOString(), "2026-12-25T18:30:00.000Z");
  const march = reportPeriods(new Date("2028-03-31T12:00:00Z"));
  assert.equal(march.months[4].start.toISOString(), "2028-01-31T18:30:00.000Z");
  assert.equal(march.months[4].end.toISOString(), "2028-02-29T18:30:00.000Z");
});
