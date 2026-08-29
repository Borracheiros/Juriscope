import { createHash } from "node:crypto";
import pg from "pg";
import { MIGRATIONS } from "./migrations";

export class MigrationChecksumError extends Error {
  readonly code = "MIGRATION_CHECKSUM_MISMATCH";
  constructor(id: string) {
    super(`Checksum mismatch for migration ${id}`);
    this.name = "MigrationChecksumError";
  }
}

export function checksumOf(sql: string): string {
  return createHash("sha256").update(sql).digest("hex");
}

export function schemaFingerprint(): string {
  const hash = createHash("sha256");
  for (const m of MIGRATIONS) {
    hash.update(m.id);
    hash.update(m.sql);
  }
  return hash.digest("hex");
}

export async function runMigrations(ownerUrl: string): Promise<{ applied: string[]; pendingAfter: number }> {
  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const appliedRows = await client.query<{ id: string; checksum: string }>(
      "SELECT id, checksum FROM schema_migrations ORDER BY id",
    );
    const applied = new Map(appliedRows.rows.map((r) => [r.id, r.checksum]));
    const ran: string[] = [];
    for (const m of MIGRATIONS) {
      const expected = checksumOf(m.sql);
      const existing = applied.get(m.id);
      if (existing && existing !== expected) {
        throw new MigrationChecksumError(m.id);
      }
      if (existing) continue;
      await client.query(m.sql);
      await client.query("INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2)", [m.id, expected]);
      ran.push(m.id);
    }
    await client.query("COMMIT");
    return { applied: ran, pendingAfter: 0 };
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    await client.end();
  }
}

export async function pendingCount(ownerUrl: string): Promise<number> {
  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    const exists = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations'
    `);
    if (exists.rowCount === 0) return MIGRATIONS.length;
    const applied = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
    const set = new Set(applied.rows.map((r) => r.id));
    return MIGRATIONS.filter((m) => !set.has(m.id)).length;
  } finally {
    await client.end();
  }
}

export async function showMigrations(ownerUrl: string): Promise<{ id: string; applied: boolean; checksum?: string }[]> {
  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    const exists = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations'
    `);
    const applied = new Map<string, string>();
    if ((exists.rowCount ?? 0) > 0) {
      const rows = await client.query<{ id: string; checksum: string }>("SELECT id, checksum FROM schema_migrations");
      for (const r of rows.rows) applied.set(r.id, r.checksum);
    }
    return MIGRATIONS.map((m) => ({
      id: m.id,
      applied: applied.has(m.id),
      checksum: applied.get(m.id) ?? checksumOf(m.sql),
    }));
  } finally {
    await client.end();
  }
}
