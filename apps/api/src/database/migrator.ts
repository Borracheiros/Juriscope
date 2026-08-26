import { createHash } from "node:crypto";
import pg from "pg";
import { MIGRATIONS } from "./migrations";

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
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const appliedRows = await client.query<{ id: string }>("SELECT id FROM schema_migrations ORDER BY id");
    const applied = new Set(appliedRows.rows.map((r) => r.id));
    const ran: string[] = [];
    for (const m of MIGRATIONS) {
      if (applied.has(m.id)) continue;
      await client.query(m.sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [m.id]);
      ran.push(m.id);
    }
    await client.query("COMMIT");
    const pending = MIGRATIONS.filter((m) => !applied.has(m.id) && !ran.includes(m.id)).length;
    return { applied: ran, pendingAfter: pending };
  } catch (err) {
    await client.query("ROLLBACK");
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
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'schema_migrations'
    `);
    if (exists.rowCount === 0) return MIGRATIONS.length;
    const applied = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
    const set = new Set(applied.rows.map((r) => r.id));
    return MIGRATIONS.filter((m) => !set.has(m.id)).length;
  } finally {
    await client.end();
  }
}

export async function showMigrations(ownerUrl: string): Promise<{ id: string; applied: boolean }[]> {
  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    const exists = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations'
    `);
    const applied = new Set<string>();
    if ((exists.rowCount ?? 0) > 0) {
      const rows = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
      for (const r of rows.rows) applied.add(r.id);
    }
    return MIGRATIONS.map((m) => ({ id: m.id, applied: applied.has(m.id) }));
  } finally {
    await client.end();
  }
}
