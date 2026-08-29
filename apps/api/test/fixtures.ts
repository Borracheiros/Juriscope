import { hash } from "bcryptjs";
import pg from "pg";
import { PROFILE_CAPABILITIES } from "@juridico-ia/contracts";

const TENANT_A = "11111111-1111-4111-8111-111111111111";
const TENANT_B = "22222222-2222-4222-8222-222222222222";
const USER_A = "11111111-1111-4111-8111-1111111111aa";
const USER_B = "22222222-2222-4222-8222-2222222222bb";
const PROF_A = "11111111-1111-4111-8111-1111111111a1";
const PROF_B = "22222222-2222-4222-8222-2222222222b1";
const ADMIN_A = "11111111-1111-4111-8111-1111111111a2";
const USER_ADMIN_A = "11111111-1111-4111-8111-1111111111a3";

/* SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN */
export const SYNTHETIC_PASSWORD = "SyntheticPass1!";
/* SECRET_SCAN_ALLOW_SYNTHETIC_END */

export const ids = {
  tenantA: TENANT_A,
  tenantB: TENANT_B,
  userA: USER_A,
  userB: USER_B,
  adminA: USER_ADMIN_A,
  profileA: PROF_A,
  profileB: PROF_B,
  adminProfileA: ADMIN_A,
};

export const fixtures = {
  tenantA: { id: TENANT_A, slug: "escritorio-alpha", email: "lawyer.alpha@example.test", adminEmail: "admin.alpha@example.test" },
  tenantB: { id: TENANT_B, slug: "escritorio-beta", email: "lawyer.beta@example.test" },
};

export async function seedSyntheticTenants(ownerUrl: string): Promise<void> {
  const hashValue = await hash(SYNTHETIC_PASSWORD, 4);
  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    await client.query(`
      INSERT INTO tenants (id, slug, name) VALUES
        ($1, 'escritorio-alpha', 'Escritório Alpha'),
        ($2, 'escritorio-beta', 'Escritório Beta')
    `, [TENANT_A, TENANT_B]);
    await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, display_name) VALUES
        ($1, $2, 'lawyer.alpha@example.test', $3, 'Ana Alpha'),
        ($4, $2, 'admin.alpha@example.test', $3, 'Admin Alpha'),
        ($5, $6, 'lawyer.beta@example.test', $3, 'Bruno Beta')`,
      [USER_A, TENANT_A, hashValue, USER_ADMIN_A, USER_B, TENANT_B],
    );
    await client.query(
      `INSERT INTO access_profiles (id, tenant_id, code, name) VALUES
        ($1, $2, 'lawyer', 'Advogado'),
        ($3, $2, 'tenant_admin', 'Admin'),
        ($4, $5, 'lawyer', 'Advogado')`,
      [PROF_A, TENANT_A, ADMIN_A, PROF_B, TENANT_B],
    );
    for (const cap of PROFILE_CAPABILITIES.lawyer) {
      await client.query(`INSERT INTO profile_capabilities (profile_id, capability) VALUES ($1,$2)`, [PROF_A, cap]);
      await client.query(`INSERT INTO profile_capabilities (profile_id, capability) VALUES ($1,$2)`, [PROF_B, cap]);
    }
    for (const cap of PROFILE_CAPABILITIES.tenant_admin) {
      await client.query(`INSERT INTO profile_capabilities (profile_id, capability) VALUES ($1,$2)`, [ADMIN_A, cap]);
    }
    await client.query(
      `INSERT INTO memberships (tenant_id, user_id, profile_id) VALUES
        ($1,$2,$3), ($1,$4,$5), ($6,$7,$8)`,
      [TENANT_A, USER_A, PROF_A, USER_ADMIN_A, ADMIN_A, TENANT_B, USER_B, PROF_B],
    );
  } finally {
    await client.end();
  }
}
