import type pg from "pg";
import { insertAudit } from "../audit/audit.repository";
import { beginIdempotent } from "../idempotency/idempotency.service";
import { insertOutbox } from "../outbox/outbox.repository";
import type { Principal } from "@juridico-ia/security";

export async function runHeartbeat(
  client: pg.PoolClient,
  principal: Principal,
  idempotencyKey: string | undefined,
  requestHash: string,
): Promise<{ status: number; body: { ok: true; auditId: string } }> {
  const execute = async () => {
    const auditId = await insertAudit(client, {
      tenantId: principal.tenantId,
      actorUserId: principal.userId,
      action: "ops.heartbeat",
      entity: "session",
      entityId: principal.userId,
      result: "SUCCESS",
    });
    await insertOutbox(client, {
      tenantId: principal.tenantId,
      eventType: "SessionHeartbeat",
      payload: { auditId },
    });
    return { status: 200, body: { ok: true as const, auditId } };
  };
  if (!idempotencyKey) {
    return execute();
  }
  const result = await beginIdempotent(client, {
    tenantId: principal.tenantId,
    operation: "ops.heartbeat",
    key: idempotencyKey,
    requestHash,
    run: execute,
  });
  return { status: result.status, body: result.body };
}
