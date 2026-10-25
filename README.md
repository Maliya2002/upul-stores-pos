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
   npm run db:push
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
- Manager refunds validate the remaining paid balance inside a serializable transaction. Full refunds return stock once; partial financial refunds do not return quantities.
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

Run a compiled build using `npm run build`, then `npm start`, while PostgreSQL is running. System fonts avoid a build-time Google Fonts download.

## Remaining release work

This is a development build, not a declaration that every module is production-ready.

- Configure and implement real email/OTP delivery. Development reset tokens are available locally; production recovery reports that delivery is not configured.
- Email/WhatsApp notification settings remain a placeholder.
- Payment gateway processing, gift cards, split payments and variant-level POS sales are not integrated.
- Employee attendance/payroll/leave screens need an operational workflow review.
- Partial item returns and refund-adjusted historical profit/report accounting need further work; the dashboard displays invoice totals net of refunds.
- Add checkout idempotency before relying on automatic network retries or offline synchronization.
- Replace demo credentials/data, verify all role-specific workflows, and rerun the dependency audit before deployment.
- Use PostgreSQL `pg_dump` and a tested restore procedure for real backups; the UI export excludes passwords and some related tables.

No live shop database or external payment service is used by the local setup.
