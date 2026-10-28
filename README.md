# Upul Stores POS

A Next.js, React and PostgreSQL point-of-sale development project.

## Local setup (Windows)

Use Node.js 24 and npm. The project includes a local PostgreSQL runner; Docker is not required.

1. Install dependencies: `npm ci`.
2. In one terminal, run `npm run db:local` and leave it running.
   - The first run creates a private `.env` with random database credentials and an authentication secret.
   - PostgreSQL listens only on `127.0.0.1:55432`. Its persistent files live in `.local/postgres`.
   - Stop it with Ctrl+C. Restarting uses the existing data.
   - An existing `.env` is never overwritten.
3. In another terminal:
   ```powershell
   npm run db:migrate
   npm run db:generate
   npm run db:seed
   npm run dev
   ```
4. Open http://localhost:3000.

The seed creates demo products, staff and customers in the selected development database. Owner login: `admin@upulstores.lk` / `Admin@123`. These are demo credentials, not production accounts. The manager, cashier and inventory demo users are listed by the seed command.

For an existing PostgreSQL server, copy `.env.example` to `.env` and set its connection and authentication secret. Do not run `db:local` for that connection. Neither `.env` nor `.local` belongs in Git.

## Working flows

- Owner, admin, manager, cashier and inventory roles; server actions check current active staff records.
- Cashiers enter at the POS; inventory staff enter at inventory. Restricted navigation is filtered by role.
- Product/customer/supplier/catalog management and purchases.
- Desktop and mobile carts, held orders, coupons, cash change and invoice printing.
- Checkout calculates prices, tax, discounts and cashier identity on the server.
- Stock updates, coupon usage, customer totals and orders commit together. Concurrent stock/coupon conflicts return a retry message.
- Checkout requests have a unique reference and staff-bound payload fingerprint. Replays return the original invoice; changed payloads cannot reuse the reference. Stock, payments, coupons, customer totals and audit entries are written only once.
- The payment screen saves an unresolved request in this tab's session storage before sending it. Reloading the POS with the same staff account offers **Retry saved sale**. It retains the original cart and tender while the result is uncertain. Do not collect payment again. This is tab-scoped recovery, not an offline payment queue or recovery after browser storage is cleared.
- Managers select quantities for item returns, choose the refund method and record a reason. Only received, inspected items explicitly marked for restocking increase sellable stock. Returned quantities cannot exceed the invoice, even with concurrent requests.
- Refunds use original invoice amounts with discounts allocated in integer cents. Repeated partial returns add up to the exact discounted line total. New sales preserve line-level net amounts and purchase-cost snapshots.
- Returns have their own replay-safe references, staff attribution, audit entries and invoice history. Older amount-only refunds require manual reconciliation and cannot be mixed with new item returns.
- Sales totals and invoice rows display net sales after refunds against those invoices; these are invoice-period totals, not a cash-flow report by refund date.
- Dashboard sales, recent invoices and stock alerts come from PostgreSQL, using Asia/Colombo dates.
- Store and receipt settings are used on invoices. Owner/admin can create cashier accounts from Employees.
- JSON store-data export. This is not a full restore-capable database backup.

Card, bank and QR options record an externally received payment; the app does not charge a gateway. Gift-card and mixed-tender checkout are not enabled.

## Verification

```powershell
npm run db:generate
npm test
npm run test:integration
npm run typecheck
npm run lint
npm run build
```

Integration tests require the project-local database at `127.0.0.1:55432/upul_pos`. They call the real server actions against PostgreSQL, replacing only the HTTP session and Next.js cache boundary. Every run creates uniquely named fixtures and removes only those fixtures; it does not reset existing data.

Coverage includes tampered checkout values, invalid quantities, rounding, coupon limits, stock overselling, transaction rollback, concurrent checkout/refunds, inactive staff, and held-cart preservation.

Additional tests cover concurrent duplicate requests, payload conflicts, exact partial-return amounts, damaged versus restocked returns, staff attribution, net sales and installing all migrations on an empty disposable database. Integration tests need permission to create and drop their generated `pos_migration_test_*` database. GitHub Actions runs tests, lint and the production build against a disposable PostgreSQL service.

## Upgrading the earlier development database

The existing local database has already been baselined and migrated without deleting its demo invoices. Future changes use `npm run db:migrate`; do not use `db:push` to bypass migration history.

For another database created with the earlier `db:push` workflow, back it up and compare its schema with the baseline migration before marking `20261025000000_baseline` as applied using `prisma migrate resolve`. Then run `npm run db:migrate` and `npm run db:generate`. Do not mark a baseline as applied on an empty database; a new database runs both migrations normally. Existing invoice net amounts and costs remain nullable rather than inventing historical purchase costs.

Run a compiled build using `npm run build`, then `npm start`, while PostgreSQL is running. System fonts avoid a build-time Google Fonts download.

## Remaining release work

This is a development build, not a declaration that every module is production-ready.

- Configure and implement real email/OTP delivery. Development reset tokens are available locally; production recovery reports that delivery is not configured.
- Email/WhatsApp notification settings remain a placeholder.
- Payment gateway processing, gift cards, split payments and variant-level POS sales are not integrated.
- Employee attendance/payroll/leave screens need an operational workflow review.
- Reports now show transaction-period net receipts and estimated profit using saved item costs, allocated tax, refunds and expenses paid in the period. Legacy records without sufficient historical details show unavailable profit. Validate expense completeness, tax allocation and inventory valuation with the shop operator before financial sign-off; see IMPLEMENTATION-PLAN.md.
- Multi-terminal/offline reconciliation, cash-drawer shifts, end-of-day closing and recovery across cleared browser sessions require further work.
- Replace demo credentials/data, verify all role-specific workflows, and rerun the dependency audit before deployment.
- Use PostgreSQL `pg_dump` and a tested restore procedure for real backups; the UI export excludes passwords and some related tables.

No live shop database or external payment service is used by the local setup.

### Cash shifts

Open Cash Shifts from Operations before trading to track your drawer. Each staff member can have one open shift. Cash sales contribute the invoice total (tender less change); card/bank/QR sales do not add cash. Cash refunds are assigned to the open shift of the staff member recording the return, including returns of older invoices. Cash in/out entries require a reason. Closing saves the expected balance, counted cash and difference; a discrepancy requires an explanation. Closed balances cannot be edited.

Shift tracking is opt-in in this release: transactions without an open shift remain unassigned, and historical invoices are not reassigned. A shift represents one staff member’s drawer, not a shared register. Request retries are protected on the server; for cash movements keep the page open when retrying an uncertain response, and check history before re-entering after a reload. The screen shows your last 30 shifts. Managers, admins and owners can review all staff shifts at /shifts/reconciliation, filter by cashier/status/cash difference, and inspect cash movements. Closed balances are read-only. Mandatory shift enforcement and manager sign-off are not yet implemented.
