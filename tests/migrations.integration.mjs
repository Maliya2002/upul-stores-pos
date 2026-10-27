import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

test("migration history installs on an empty disposable database", async () => {
  const source = new URL(process.env.DATABASE_URL);
  assert.equal(source.hostname, "127.0.0.1");
  assert.equal(source.port, "55432");
  assert.equal(source.pathname, "/upul_pos");
  const name = `pos_migration_test_${randomUUID().replaceAll("-", "")}`;
  const admin = new PrismaClient();
  const target = new URL(source);
  target.pathname = `/${name}`;
  const fresh = new PrismaClient({ datasources: { db: { url: target.href } } });
  let created = false;
  try {
    // Name is generated here from a UUID; no user SQL or existing database names.
    await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
    created = true;
    const result = spawnSync(
      process.execPath,
      ["node_modules/prisma/build/index.js", "migrate", "deploy"],
      {
        env: { ...process.env, DATABASE_URL: target.href },
        encoding: "utf8",
        timeout: 60000,
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await fresh.order.count(), 0);
    assert.equal(await fresh.refundItem.count(), 0);
    const migrations = await fresh.$queryRawUnsafe(
      'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL',
    );
    assert.equal(migrations.length, 2);
  } finally {
    await fresh.$disconnect();
    if (created) await admin.$executeRawUnsafe(`DROP DATABASE "${name}"`);
    await admin.$disconnect();
  }
});
