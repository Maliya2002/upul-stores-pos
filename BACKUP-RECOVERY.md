# Local database backup and recovery

## Create and verify

Keep local PostgreSQL running (`npm run db:local`). From the repository root run:

```powershell
npm run db:backup
```

This creates a unique folder under `.local/backups/` containing:

- `database.dump`: PostgreSQL custom-format archive.
- `manifest.json`: archive SHA-256, size, UTC timestamp and public-table row counts/fingerprints from the same repeatable-read snapshot used by pg_dump.
- `verification.json`: written only after restoration and data verification succeed.

The command creates a fresh, randomly named `pos_restore_test_*` database, restores in a single transaction, compares every public table's rows and fingerprints, disconnects, then drops that generated database. It never restores over `upul_pos`. Any failed step exits nonzero. A `.partial` archive or missing manifest is not a completed backup. A completed archive without a successful verification must be investigated.

Verify a retained backup again:

```powershell
npm run db:backup:verify -- ".local/backups/<backup-folder>"
```

Only verify archives produced by this project or otherwise trusted: a PostgreSQL archive contains executable SQL. A checksum detects corruption, not malicious replacement of both the archive and its manifest.

## Client tools

Use PostgreSQL 18 `pg_dump` and `pg_restore`. On this Windows development machine they are in `.local/tools/pgsql/bin`. Set `PG_BIN` to another trusted PostgreSQL 18 `bin` directory if necessary. On other platforms the commands can be on PATH. The source is the [official EDB binary distribution](https://www.enterprisedb.com/download-postgresql-binaries), linked by [PostgreSQL's Windows download page](https://www.postgresql.org/download/windows/).

Scripts read `.env` without printing the URL/password. Child tools receive credentials through environment variables, not command-line arguments. These scripts deliberately support only `127.0.0.1:55432/upul_pos`; production-host configuration needs a separate operational review. The database role must be able to create and drop the disposable verification database.

## Keep a recoverable copy

The local folder is ignored by Git. It contains business data and authentication records; restrict filesystem access. Copy the complete verified folder to an encrypted separate device or protected backup destination. A backup on the same disk does not protect against disk failure. Retain `.env`/deployment secrets separately in protected storage, plus the application version and any uploaded files; the database archive does not include those files, server roles or server configuration.

No backup schedule, remote upload or retention deletion is configured. Run backups before updates and at the shop's agreed frequency, and repeat a restore drill periodically. Do not delete the last verified copy while making a replacement.

## Recovery procedure

1. Stop writes from the shop application and preserve the damaged database for diagnosis.
2. Verify the selected backup with the command above. A failure must be resolved before cutover.
3. Have the operator restore `database.dump` into a **new empty database** using PostgreSQL 18 `pg_restore --exit-on-error --single-transaction --no-owner --no-privileges`. Use a secure credential mechanism; do not put a password in a command argument. Do not use `--clean` against the shop database.
4. Run the matching application version against that new database in an isolated environment. Confirm login, stock, invoices/returns, supplier debt, payments and cash shifts with the operator. Automated table fingerprints establish data equivalence; they do not replace shop acceptance or measure downtime.
5. Switch the application connection only after acceptance. Keep the original database and verified archive until the recovery is signed off.

The script does not perform a live cutover or overwrite an existing database. Interrupted verification may leave a database named `pos_restore_test_*`; identify the exact interrupted run before removing it. Public-table fingerprint verification does not compare roles, extensions outside public, or future sequence behavior; pg_dump/pg_restore includes database schema and sequence state, but application-level recovery checks remain required.
