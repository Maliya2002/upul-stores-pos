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

## Reporting delivery

Reports now use Colombo transaction periods: sales on invoice date, returns on return date, and expenses on paid date. Completed and refunded sales remain in the original sale period; cancelled/pending orders are excluded. Net receipts include tax and invoice discounts. Estimated profit removes allocated tax using saved line tax rates, historical unit cost and recorded expenses. Only restocked returns reverse cost. Missing historical costs, line allocations or amount-only return details suppress profit instead of substituting today's prices.

Top products is explicitly a gross line-sales ranking before invoice discounts/returns, not a net-product profitability report. A full net-product report remains future work. Expense completeness, tax-allocation assumptions and inventory valuation policy need operator review before financial sign-off. The period reader loads matching lines; large-volume performance testing remains pending.

Verified with pure arithmetic/date tests and PostgreSQL integration fixtures for cross-period refunds, paid dates, saved costs, cancelled-order exclusion and staff permissions. Fixtures roll back without changing shop records.

## Purchase receiving delivery

The existing fully received/fully paid purchase action now requires a UUID request reference. A unique database key and staff/payload fingerprint prevent repeated stock increments on retry; serializable retries re-read the receipt. Purchase, stock history, supplier order count and staff audit entry commit together. The form retains an unresolved request in session storage and restores it after reload. Clear browser storage/new tabs do not preserve that recovery context: inspect purchase history before re-entering an uncertain receipt.

This form records cash-paid goods already received. Pending orders, partial receiving, supplier credit/payments and stock valuation remain future work. Purchase receiving does not yet change product valuation; managers must maintain product cost under the current valuation policy.

Validation: 9 database integration checks, empty-database migration, targeted lint, TypeScript and Webpack production build passed. Default Turbopack build ran out of disk space; generated caches were removed. Browser acceptance remains pending. Free C: space remained approximately 220 MB after the build; more space is needed for reliable development.

## Manual stock safety

Manual stock-in now records count adjustments, while stock-out allows damaged, expired or count-correction movements. Purchases, sales and customer returns must use their dedicated workflows. A reason is mandatory; inactive products, fractional/unbounded amounts and negative resulting stock are rejected. Product update, movement and staff audit record commit atomically. Optimistic quantity checks reject conflicting writes. Absolute count actions require the previously observed quantity and refuse stale counts.

The client prevents simultaneous clicks and retains an unresolved request in session storage per stock direction. Reloading the same tab restores the payload for confirmation. Server-side unique keys bind each request to its staff member, direction and validated payload; altered replays are rejected. Serializable transactions apply stock, movement history and audit records once. Physical counts (including unchanged counts) also record replay references so retries cannot overwrite subsequent stock activity. No new physical-count UI was added. Damaged/expired stock valuation in profit reports remains future work. Cleared storage or another browser/tab does not carry the pending reference; check movement history before re-entering.

Stock validation: 10 database integration checks passed, including competing stock removals, stale counts, audit history and role checks. Targeted lint has no errors (3 existing-style warnings); Webpack production build passed. Browser acceptance remains pending.

Stock retry verification: 11 database/migration test entries passed, including concurrent identical requests, changed-payload/direction rejection and replaying an unchanged count after later stock activity. Browser refresh/recovery visual acceptance remains pending.

Retry build verification: Webpack production build passed. Targeted lint passed with the same 3 warnings.
