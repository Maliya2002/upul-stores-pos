import EmbeddedPostgres from "embedded-postgres";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";

if (!existsSync(".env")) {
  const password = randomBytes(24).toString("hex");
  writeFileSync(
    ".env",
    `DATABASE_URL="postgresql://postgres:${password}@127.0.0.1:55432/upul_pos?schema=public"\nAUTH_SECRET="${randomBytes(32).toString("hex")}"\nAUTH_URL="http://localhost:3000"\n`,
  );
}
process.loadEnvFile(".env");
const url = new URL(process.env.DATABASE_URL);
if (
  url.hostname !== "127.0.0.1" ||
  url.port !== "55432" ||
  url.pathname !== "/upul_pos"
) {
  throw new Error(
    "db:local only starts the project database at 127.0.0.1:55432/upul_pos. Use your existing PostgreSQL service for other connections.",
  );
}
mkdirSync(".local", { recursive: true });
const pg = new EmbeddedPostgres({
  databaseDir: "./.local/postgres",
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: 55432,
  persistent: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
});
if (!existsSync(".local/postgres/PG_VERSION")) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
const existing = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  ["upul_pos"],
);
await client.end();
if (!existing.rowCount) await pg.createDatabase("upul_pos");
console.log(
  "Local PostgreSQL ready at 127.0.0.1:55432/upul_pos. Keep this terminal running.",
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
