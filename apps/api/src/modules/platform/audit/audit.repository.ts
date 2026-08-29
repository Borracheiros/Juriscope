import type pg from "pg";
import { getCorrelationId } from "@juridico-ia/observability";

export type AuditInput = {
  tenantId: string;
  actorUserId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  result: "SUCCESS" | "DENIED" | "FAILURE";
  origin?: string;
  metadata?: Record<string, unknown>;
};

const FORBIDDEN_META = ["password", "token", "cookie", "secret", "prompt", "authorization", "cpf"];

function isForbiddenKey(key: string): boolean {
  const lower = key.toLowerCase();
  return FORBIDDEN_META.some((f) => lower.includes(f));
}

/** Recursive sanitize for objects and arrays. Omits forbidden keys at any depth. */
export function sanitizeMetadata(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMetadata(item));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isForbiddenKey(k)) continue;
      if (typeof v === "string" && v.length > 200) {
        out[k] = "[truncated]";
      } else {
        out[k] = sanitizeMetadata(v);
      }
    }
    return out;
  }
  return value;
}

export async function insertAudit(client: pg.PoolClient, input: AuditInput): Promise<string> {
  const rows = await client.query<{ id: string }>(
    `INSERT INTO audit_events (
       tenant_id, actor_user_id, action, entity, entity_id, result, origin, correlation_id, metadata
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      input.tenantId,
      input.actorUserId ?? null,
      input.action,
      input.entity,
      input.entityId ?? null,
      input.result,
      input.origin ?? "api",
      getCorrelationId() ?? null,
      JSON.stringify(sanitizeMetadata(input.metadata ?? {})),
    ],
  );
  return rows.rows[0]!.id;
}
