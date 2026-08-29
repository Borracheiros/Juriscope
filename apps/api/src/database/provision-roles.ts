import type pg from "pg";

export type RuntimeRoleSecrets = {
  appPassword: string;
  workerPassword: string;
};

/**
 * Provisions LOGIN + PASSWORD for runtime roles.
 * Passwords are never logged. Call after migrations create the role shells.
 */
export async function provisionRuntimeRoles(
  owner: pg.Client | pg.PoolClient,
  secrets: RuntimeRoleSecrets,
): Promise<void> {
  if (!secrets.appPassword || !secrets.workerPassword) {
    throw new Error("RUNTIME_ROLE_PASSWORD_REQUIRED");
  }
  if (secrets.appPassword.length < 16 || secrets.workerPassword.length < 16) {
    throw new Error("RUNTIME_ROLE_PASSWORD_TOO_SHORT");
  }
  await owner.query(`ALTER ROLE juridico_app WITH LOGIN PASSWORD ${owner.escapeLiteral(secrets.appPassword)}`);
  await owner.query(
    `ALTER ROLE juridico_worker WITH LOGIN PASSWORD ${owner.escapeLiteral(secrets.workerPassword)}`,
  );
}

export async function grantConnectOnCurrentDatabase(owner: pg.Client | pg.PoolClient): Promise<void> {
  const db = await owner.query<{ current_database: string }>(`SELECT current_database()`);
  const name = db.rows[0]?.current_database;
  if (!name) throw new Error("DATABASE_NAME_UNAVAILABLE");
  await owner.query(`GRANT CONNECT ON DATABASE ${owner.escapeIdentifier(name)} TO juridico_app, juridico_worker`);
}
