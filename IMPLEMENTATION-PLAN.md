# Shop readiness plan

Work in this order. A feature is complete only after its business rules and failure paths have been verified. This checklist is not a production-readiness certification.

1. **Cash reconciliation:** existing staff/status review and immutable closing balances; add inclusive Colombo opening-date filters and test midnight boundaries. Manager sign-off remains separate work.
2. **Sales and profit reporting:** audit existing calculations; account for returns, invoice discounts and historical item cost snapshots. Define handling for legacy orders without snapshots before showing profit totals.
3. **Stock and purchasing:** inspect existing adjustments, receiving and supplier balances; fill gaps with atomic writes, permission checks and audit records.
4. **Customer credit:** verify credit sales, partial payments, reversals and outstanding balances against a transaction history.
5. **Operational resilience:** test database backup and restore into an isolated database; document deployment, recovery and update procedures.
6. **Shop acceptance:** verify simultaneous cashiers, replay/retry recovery, role restrictions, responsive screens and a complete sale/return/shift flow. Test the actual barcode scanner and receipt printer with the shop operator.

## Date-filter delivery

- Filters select shifts by `openedAt`, using Asia/Colombo calendar days. Both endpoints are inclusive; the database upper bound is the next midnight, exclusive.
- Selected balances cover the whole shift, even if it closes on a later date.
- Empty endpoints are unbounded. Invalid or reversed dates show an error and no shift results.
- Supported dates start at 2007-01-01, after Sri Lanka adopted the current UTC+05:30 offset.
- Pagination preserves filters; Reset clears them and remounts the filter controls.
- Browser acceptance remains pending while local browser use is disabled. Verify narrow-screen controls, Apply, Reset and pagination after enabling browser access.
- Verified: four focused unit tests, PostgreSQL shift integration test including exact midnight boundaries, targeted ESLint and production build.

## Next confirmed reporting defects

`src/features/reports/actions/report-actions.ts` currently computes monthly profit as revenue minus expenses, without cost of goods sold. Sales aggregates do not deduct refunds, and reporting date boundaries depend on the host timezone. Correct these together with regression fixtures for partial returns, discounts, historical costs and Colombo midnight boundaries before treating profit as reliable.
