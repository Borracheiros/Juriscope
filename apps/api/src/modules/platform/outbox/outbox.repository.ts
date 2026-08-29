import type pg from "pg";
import { getCorrelationId } from "@juridico-ia/observability";

export async function insertOutbox(
  client: pg.PoolClient,
  input: { tenantId: string; eventType: string; payload: Record<string, unknown> },
): Promise<string> {
  const rows = await client.query<{ id: string }>(
    `INSERT INTO outbox_events (tenant_id, event_type, payload, status, correlation_id)
     VALUES ($1,$2,$3,'PENDING',$4)
     RETURNING id`,
    [input.tenantId, input.eventType, JSON.stringify(input.payload), getCorrelationId() ?? null],
  );
  return rows.rows[0]!.id;
}
