import type { Capability } from "@juridico-ia/contracts";
import type { Principal } from "@juridico-ia/security";
import { assertCapability } from "@juridico-ia/security";
import type pg from "pg";
import { insertAudit } from "../audit/audit.repository";
import { withTenantTx } from "../../../database/pool";

export async function resolvePrincipal(
  client: pg.PoolClient,
  claims: { userId: string; tenantId: string },
): Promise<Principal> {
  const row = await client.query<{
    user_id: string;
    tenant_id: string;
    profile_id: string;
    profile_code: string;
    user_status: string;
    tenant_status: string;
    capabilities: string[] | null;
  }>(
    `SELECT u.id AS user_id, u.tenant_id, u.status AS user_status, t.status AS tenant_status,
            m.profile_id, p.code AS profile_code,
            COALESCE(array_agg(pc.capability) FILTER (WHERE pc.capability IS NOT NULL), '{}') AS capabilities
     FROM users u
     JOIN tenants t ON t.id = u.tenant_id
     JOIN memberships m ON m.user_id = u.id AND m.tenant_id = u.tenant_id
     JOIN access_profiles p ON p.id = m.profile_id
     LEFT JOIN profile_capabilities pc ON pc.profile_id = p.id
     WHERE u.id = $1 AND u.tenant_id = $2
     GROUP BY u.id, u.tenant_id, u.status, t.status, m.profile_id, p.code`,
    [claims.userId, claims.tenantId],
  );
  const found = row.rows[0];
  if (!found || found.user_status !== "ACTIVE" || found.tenant_status !== "ACTIVE") {
    throw Object.assign(new Error("UNAUTHENTICATED"), { code: "UNAUTHENTICATED" });
  }
  return {
    userId: found.user_id,
    tenantId: found.tenant_id,
    profileId: found.profile_id,
    profileCode: found.profile_code,
    capabilities: (found.capabilities ?? []) as Capability[],
  };
}

export async function denyIfUnauthorized(
  pool: pg.Pool,
  principal: Principal,
  capability: Capability,
  entity: string,
): Promise<void> {
  try {
    assertCapability(principal, capability);
  } catch {
    await withTenantTx(pool, principal.tenantId, (client) =>
      insertAudit(client, {
        tenantId: principal.tenantId,
        actorUserId: principal.userId,
        action: "authorization.denied",
        entity,
        entityId: capability,
        result: "DENIED",
        metadata: { capability },
      }),
    );
    throw Object.assign(new Error("ACCESS_DENIED"), { code: "ACCESS_DENIED" });
  }
}
