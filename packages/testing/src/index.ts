import { randomBytes } from "node:crypto";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import pg from "pg";

export type ScratchDb = {
  ownerUrl: string;
  appUrl: string;
  workerUrl: string;
  host: string;
  port: number;
  containerId: string;
  stop: () => Promise<void>;
};

function randomPassword(): string {
  return randomBytes(24).toString("base64url");
}

function buildPgUrl(user: string, password: string, host: string, port: number, database: string): string {
  const url = new URL("postgresql://127.0.0.1");
  url.hostname = host;
  url.port = String(port);
  url.pathname = `/${database}`;
  url.username = user;
  url.password = password;
  return url.toString();
}

async function waitForOwner(ownerUrl: string): Promise<pg.Client> {
  for (let i = 0; i < 20; i += 1) {
    const owner = new pg.Client({ connectionString: ownerUrl });
    try {
      await owner.connect();
      return owner;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw new Error("scratch postgres did not accept connections");
}

/** Creates roles with ephemeral passwords (never printed). */
export async function provisionScratchRoles(
  owner: pg.Client,
  secrets: { appPassword: string; workerPassword: string },
): Promise<void> {
  await owner.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'juridico_app') THEN
        CREATE ROLE juridico_app NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'juridico_worker') THEN
        CREATE ROLE juridico_worker NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
      END IF;
    END $$;
  `);
  await owner.query(`ALTER ROLE juridico_app WITH LOGIN PASSWORD ${owner.escapeLiteral(secrets.appPassword)}`);
  await owner.query(
    `ALTER ROLE juridico_worker WITH LOGIN PASSWORD ${owner.escapeLiteral(secrets.workerPassword)}`,
  );
  const db = await owner.query<{ current_database: string }>(`SELECT current_database()`);
  const name = db.rows[0]!.current_database;
  await owner.query(`GRANT CONNECT ON DATABASE ${owner.escapeIdentifier(name)} TO juridico_app, juridico_worker`);
}

export async function startScratchPostgres(): Promise<ScratchDb> {
  const ownerPassword = randomPassword();
  const appPassword = randomPassword();
  const workerPassword = randomPassword();

  const container: StartedTestContainer = await new GenericContainer("pgvector/pgvector:pg16")
    .withEnvironment({
      POSTGRES_USER: "juridico",
      POSTGRES_PASSWORD: ownerPassword,
      POSTGRES_DB: "juridico_ia_test",
    })
    .withExposedPorts(5432)
    .withStartupTimeout(120_000)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const ownerUrl = buildPgUrl("juridico", ownerPassword, host, port, "juridico_ia_test");

  const owner = await waitForOwner(ownerUrl);
  try {
    await provisionScratchRoles(owner, { appPassword, workerPassword });
  } finally {
    await owner.end();
  }

  return {
    ownerUrl,
    appUrl: buildPgUrl("juridico_app", appPassword, host, port, "juridico_ia_test"),
    workerUrl: buildPgUrl("juridico_worker", workerPassword, host, port, "juridico_ia_test"),
    host,
    port,
    containerId: container.getId(),
    stop: async () => {
      await container.stop();
    },
  };
}

export async function withScratchPostgres<T>(fn: (db: ScratchDb) => Promise<T>): Promise<T> {
  const db = await startScratchPostgres();
  try {
    return await fn(db);
  } finally {
    await db.stop();
  }
}
