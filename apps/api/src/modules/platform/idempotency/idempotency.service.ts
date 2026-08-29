import { createHash } from "node:crypto";
import type pg from "pg";

export class IdempotencyConflictError extends Error {
  readonly code = "IDEMPOTENCY_CONFLICT";
  constructor() {
    super("Idempotency key reused with a different payload");
    this.name = "IdempotencyConflictError";
  }
}

export function canonicalHash(method: string, route: string, payload: unknown): string {
  return createHash("sha256")
    .update(method.toUpperCase())
    .update("\n")
    .update(route)
    .update("\n")
    .update(JSON.stringify(payload ?? null))
    .digest("hex");
}

export async function beginIdempotent<T>(
  client: pg.PoolClient,
  input: {
    tenantId: string;
    operation: string;
    key: string;
    requestHash: string;
    run: () => Promise<{ status: number; body: T }>;
  },
): Promise<{ status: number; body: T; replay: boolean }> {
  const inserted = await client.query<{ id: string }>(
    `INSERT INTO idempotency_keys (tenant_id, key, operation, request_hash, status)
     VALUES ($1,$2,$3,$4,'IN_PROGRESS')
     ON CONFLICT (tenant_id, operation, key) DO NOTHING
     RETURNING id`,
    [input.tenantId, input.key, input.operation, input.requestHash],
  );
  if ((inserted.rowCount ?? 0) > 0) {
    const result = await input.run();
    await client.query(
      `UPDATE idempotency_keys
       SET status = 'COMPLETED', response_status = $2, response_body = $3, updated_at = now()
       WHERE tenant_id = $1 AND operation = $4 AND key = $5`,
      [input.tenantId, result.status, JSON.stringify(result.body), input.operation, input.key],
    );
    return { ...result, replay: false };
  }
  const existing = await client.query<{
    request_hash: string;
    status: string;
    response_status: number | null;
    response_body: T;
  }>(
    `SELECT request_hash, status, response_status, response_body
     FROM idempotency_keys
     WHERE tenant_id = $1 AND operation = $2 AND key = $3
     FOR UPDATE`,
    [input.tenantId, input.operation, input.key],
  );
  const row = existing.rows[0];
  if (!row) {
    throw new Error("IDEMPOTENCY_RACE");
  }
  if (row.request_hash !== input.requestHash) {
    throw new IdempotencyConflictError();
  }
  if (row.status !== "COMPLETED" || row.response_status == null) {
    throw new Error("IDEMPOTENCY_IN_PROGRESS");
  }
  return { status: row.response_status, body: row.response_body, replay: true };
}
