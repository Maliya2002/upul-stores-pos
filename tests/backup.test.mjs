import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localConnection,
  fileHash,
  verify,
} from "../scripts/backup/db-backup.mjs";

test("backup target guard refuses other databases and remote servers", () => {
  for (const url of [
    "postgresql://u:p@example.com:55432/upul_pos",
    "postgresql://u:p@127.0.0.1:5432/upul_pos",
    "postgresql://u:p@127.0.0.1:55432/postgres",
    "https://127.0.0.1:55432/upul_pos",
  ])
    assert.throws(() => localConnection(url));
  assert.equal(
    localConnection("postgresql://u:p@127.0.0.1:55432/upul_pos?schema=public")
      .database,
    "upul_pos",
  );
});
test("corrupt archives are refused before any database connection", async () => {
  const root = await mkdtemp(join(tmpdir(), "pos-backup-test-"));
  try {
    const archive = join(root, "database.dump");
    await writeFile(archive, "original");
    const hash = await fileHash(archive);
    await writeFile(
      join(root, "manifest.json"),
      JSON.stringify({ version: 1, tables: [], archiveSha256: hash }),
    );
    await writeFile(archive, "corrupt");
    await assert.rejects(verify({}, root), /checksum/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
