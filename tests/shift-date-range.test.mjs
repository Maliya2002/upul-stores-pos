import test from "node:test";
import assert from "node:assert/strict";
import { shiftDateRange } from "../src/features/shifts/date-range.ts";

test("shift dates include a complete Colombo day across UTC dates", () => {
  const range = shiftDateRange("2026-10-28", "2026-10-28");
  assert.equal(range.error, null);
  assert.equal(range.openedAt.gte.toISOString(), "2026-10-27T18:30:00.000Z");
  assert.equal(range.openedAt.lt.toISOString(), "2026-10-28T18:30:00.000Z");
  assert.equal(shiftDateRange("2028-02-29", "2028-02-29").openedAt.lt.toISOString(), "2028-02-29T18:30:00.000Z");
  assert.equal(shiftDateRange("2026-12-31", "2026-12-31").openedAt.lt.toISOString(), "2026-12-31T18:30:00.000Z");
});

test("shift date filters allow either bound or no bounds", () => {
  assert.deepEqual(shiftDateRange(), { error: null });
  assert.equal(shiftDateRange("2026-10-28").openedAt.lt, undefined);
  assert.equal(shiftDateRange("", "2026-10-28").openedAt.gte, undefined);
});

test("shift date filters reject impossible, ambiguous and reversed dates", () => {
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "2026-1-01", "junk", "2006-01-01", "2026-10-28T00:00:00Z"]) {
    assert.ok(shiftDateRange(value).error, value);
    assert.ok(shiftDateRange("", value).error, value);
  }
  assert.ok(shiftDateRange("2026-10-29", "2026-10-28").error);
});
