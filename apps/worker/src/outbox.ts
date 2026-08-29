import type pg from "pg";

export type OutboxRecord = {
  id: string;
  tenant_id: string;
  event_type: string;
  payload: unknown;
  correlation_id: string | null;
  attempt_count: number;
  status: string;
};

export type OutboxHandler = (client: pg.PoolClient, event: OutboxRecord) => Promise<void>;

export class OutboxHandlerError extends Error {
  readonly code = "OUTBOX_HANDLER_FAILED";
  constructor(message: string) {
    super(message);
    this.name = "OutboxHandlerError";
  }
}

export function createDispatcher(handlers: Record<string, OutboxHandler>): OutboxHandler {
  return async (client, event) => {
    const handler = handlers[event.event_type];
    if (!handler) {
      throw new OutboxHandlerError(`NO_HANDLER:${event.event_type}`);
    }
    await handler(client, event);
  };
}

/** Default SessionHeartbeat effect: durable row in outbox_effects (idempotent per outbox_id). */
export const sessionHeartbeatHandler: OutboxHandler = async (client, event) => {
  const payload = (event.payload ?? {}) as { auditId?: string };
  const effectKey = `SessionHeartbeat:${payload.auditId ?? "unknown"}`;
  await client.query(`SELECT app_private.record_outbox_effect($1, $2, $3)`, [
    event.id,
    event.tenant_id,
    effectKey,
  ]);
};

export const defaultDispatcher = createDispatcher({
  SessionHeartbeat: sessionHeartbeatHandler,
});

export async function claimOutbox(
  client: pg.PoolClient,
  workerId: string,
  limit = 10,
  leaseSeconds = 30,
): Promise<OutboxRecord[]> {
  const rows = await client.query<OutboxRecord>(`SELECT * FROM app_private.claim_outbox($1, $2, $3)`, [
    workerId,
    limit,
    leaseSeconds,
  ]);
  return rows.rows;
}

export async function completeOutbox(client: pg.PoolClient, id: string, workerId: string): Promise<void> {
  await client.query(`SELECT app_private.complete_outbox($1, $2)`, [id, workerId]);
}

export async function failOutbox(client: pg.PoolClient, id: string, workerId: string, error: string): Promise<void> {
  await client.query(`SELECT app_private.fail_outbox($1, $2, $3)`, [id, workerId, error]);
}

export type ProcessOnceOptions = {
  dispatcher?: OutboxHandler;
  leaseSeconds?: number;
  limit?: number;
};

/**
 * Claim → dispatch handler (side effect) → complete.
 * Never marks PUBLISHED unless the handler returns successfully.
 */
export async function processOnce(
  pool: pg.Pool,
  workerId: string,
  options: ProcessOnceOptions = {},
): Promise<number> {
  const dispatcher = options.dispatcher ?? defaultDispatcher;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const claimed = await claimOutbox(client, workerId, options.limit ?? 10, options.leaseSeconds ?? 30);
    let completed = 0;
    for (const event of claimed) {
      try {
        await dispatcher(client, event);
        await completeOutbox(client, event.id, workerId);
        completed += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : "worker_error";
        await failOutbox(client, event.id, workerId, message);
      }
    }
    await client.query("COMMIT");
    return completed;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
