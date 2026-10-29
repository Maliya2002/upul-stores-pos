import { createRequire } from "node:module";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile, rename, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { Client } = createRequire(require.resolve("embedded-postgres"))("pg");
const quote = (name) => '"' + name.replaceAll('"', '""') + '"';

export function localConnection(value) {
  const url = new URL(value);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    url.hostname !== "127.0.0.1" ||
    url.port !== "55432" ||
    url.pathname !== "/upul_pos"
  )
    throw new Error(
      "This command only supports the project database at 127.0.0.1:55432/upul_pos.",
    );
  return {
    host: url.hostname,
    port: 55432,
    database: "upul_pos",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}
export async function fileHash(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
function tool(name) {
  const dir =
    process.env.PG_BIN ||
    (process.platform === "win32" ? resolve(".local/tools/pgsql/bin") : "");
  return dir
    ? join(dir, name + (process.platform === "win32" ? ".exe" : ""))
    : name;
}
async function runTool(name, args, connection) {
  await new Promise((ok, fail) => {
    const child = spawn(tool(name), args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
      env: {
        ...process.env,
        PGHOST: connection.host,
        PGPORT: String(connection.port),
        PGDATABASE: connection.database,
        PGUSER: connection.user,
        PGPASSWORD: connection.password,
        PGCONNECT_TIMEOUT: "10",
      },
    });
    // Drain diagnostics, but do not expose connection details or row contents.
    child.stderr.resume();
    child.once("error", () =>
      fail(
        new Error(
          `${name} could not start. Set PG_BIN to PostgreSQL 18 client tools.`,
        ),
      ),
    );
    child.once("close", (code) =>
      code === 0
        ? ok()
        : fail(
            new Error(
              `${name} failed (exit ${code}); verify tool version, database access and disk space.`,
            ),
          ),
    );
  });
}
async function inventory(client) {
  const { rows } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename COLLATE \"C\"",
  );
  const tables = [];
  await client.query("SET LOCAL TIME ZONE 'UTC'");
  await client.query("SET LOCAL DateStyle = 'ISO, YMD'");
  for (const { tablename } of rows) {
    await client.query(
      `DECLARE backup_rows NO SCROLL CURSOR FOR SELECT row_to_json(t)::text AS body FROM public.${quote(tablename)} t ORDER BY row_to_json(t)::text COLLATE "C"`,
    );
    const hash = createHash("sha256");
    let count = 0;
    for (;;) {
      const batch = await client.query("FETCH 500 FROM backup_rows");
      if (!batch.rowCount) break;
      for (const row of batch.rows) {
        hash.update(row.body + "\n");
        count++;
      }
    }
    await client.query("CLOSE backup_rows");
    tables.push({ name: tablename, count, sha256: hash.digest("hex") });
  }
  return tables;
}
export async function backup(connection, root = resolve(".local/backups")) {
  const directory = join(
    root,
    new Date().toISOString().replaceAll(":", "-") + "-" + randomUUID(),
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const client = new Client(connection);
  try {
    await client.connect();
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const { rows } = await client.query(
      "SELECT pg_export_snapshot() AS snapshot",
    );
    const partial = join(directory, "database.dump.partial");
    await runTool(
      "pg_dump",
      [
        "--format=custom",
        "--no-owner",
        "--no-privileges",
        "--no-password",
        "--snapshot=" + rows[0].snapshot,
        "--file=" + partial,
      ],
      connection,
    );
    const tables = await inventory(client);
    await client.query("COMMIT");
    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      database: "upul_pos",
      archiveSha256: await fileHash(partial),
      archiveBytes: (await stat(partial)).size,
      tables,
    };
    await rename(partial, join(directory, "database.dump"));
    await writeFile(
      join(directory, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      { flag: "wx", mode: 0o600 },
    );
    return directory;
  } finally {
    await client.end();
  }
}
export async function verify(connection, directory) {
  const manifest = JSON.parse(
    await readFile(join(directory, "manifest.json"), "utf8"),
  );
  const archive = join(directory, "database.dump");
  if (
    manifest.version !== 1 ||
    !Array.isArray(manifest.tables) ||
    (await fileHash(archive)) !== manifest.archiveSha256
  )
    throw new Error(
      "Backup manifest or archive checksum is invalid; nothing restored.",
    );
  const name = "pos_restore_test_" + randomUUID().replaceAll("-", "");
  const admin = new Client(connection);
  const restored = new Client({ ...connection, database: name });
  let created = false;
  try {
    await admin.connect();
    await admin.query(`CREATE DATABASE ${quote(name)} TEMPLATE template0`);
    created = true;
    await runTool(
      "pg_restore",
      [
        "--exit-on-error",
        "--single-transaction",
        "--no-owner",
        "--no-privileges",
        "--no-password",
        "--dbname=" + name,
        archive,
      ],
      { ...connection, database: name },
    );
    await restored.connect();
    await restored.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const tables = await inventory(restored);
    await restored.query("COMMIT");
    if (JSON.stringify(tables) !== JSON.stringify(manifest.tables))
      throw new Error(
        "Restored table contents do not match the backup snapshot.",
      );
    const report = {
      verifiedAt: new Date().toISOString(),
      archiveSha256: manifest.archiveSha256,
      tables: tables.length,
      rows: tables.reduce((n, t) => n + t.count, 0),
    };
    await writeFile(
      join(directory, "verification.json"),
      JSON.stringify(report, null, 2),
      { mode: 0o600 },
    );
    return report;
  } finally {
    try {
      await restored.end();
    } finally {
      try {
        if (created) await admin.query(`DROP DATABASE ${quote(name)}`);
      } finally { await admin.end(); }
    }
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    if (existsSync(".env")) process.loadEnvFile(".env");
    const connection = localConnection(process.env.DATABASE_URL);
    if (process.argv[2] === "create") {
      const directory = await backup(connection);
      console.log(`Backup created: ${directory}`);
      const report = await verify(connection, directory);
      console.log(
        `Restore verified: ${report.tables} tables, ${report.rows} rows. Verification database removed.`,
      );
    } else if (process.argv[2] === "verify" && process.argv[3]) {
      const report = await verify(connection, resolve(process.argv[3]));
      console.log(
        `Restore verified: ${report.tables} tables, ${report.rows} rows. Verification database removed.`,
      );
    } else
      throw new Error(
        "Usage: db-backup.mjs create | verify <backup-directory>",
      );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Backup operation failed.",
    );
    process.exitCode = 1;
  }
}
