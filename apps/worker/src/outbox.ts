import type pg from "pg";

export async function drainOutbox(client: pg.PoolClient, limit = 50): Promise<number> {
  const rows = await client.query<{ id: string }>(
    `SELECT id FROM outbox_events WHERE published_at IS NULL ORDER BY created_at ASC LIMIT $1`,
    [limit],
  );
  for (const row of rows.rows) {
    await client.query(`UPDATE outbox_events SET published_at = now() WHERE id = $1`, [row.id]);
  }
  return rows.rowCount ?? 0;
}
