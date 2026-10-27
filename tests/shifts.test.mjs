import test from "node:test";
import assert from "node:assert/strict";
import { cashBalance } from "../src/features/shifts/balance.ts";

test("drawer balance counts cash retained, refunds and adjustments in cents", () => {
  assert.equal(cashBalance(1000, [550, 100.10], [50.10], [{direction:"IN",amount:100},{direction:"OUT",amount:200}]), 1500);
  assert.equal(cashBalance(0, [0.1, 0.2], [], []), 0.3);
  assert.equal(cashBalance(100, [], [150], []), -50);
});
