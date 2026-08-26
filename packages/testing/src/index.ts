import { GenericContainer, type StartedTestContainer } from "testcontainers";
import pg from "pg";

export type ScratchDb = {
  ownerUrl: string;
  appUrl: string;
  host: string;
  port: number;
  stop: () => Promise<void>;
};

export async function startScratchPostgres(): Promise<ScratchDb> {
  const container: StartedTestContainer = await new GenericContainer("pgvector/pgvector:pg16")
    .withEnvironment({
      POSTGRES_USER: "juridico",
      POSTGRES_PASSWORD: "juridico",
      POSTGRES_DB: "juridico_ia_test",
    })
    .withExposedPorts(5432)
    .withStartupTimeout(120_000)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const ownerUrl = `postgresql://juridico:juridico@${host}:${port}/juridico_ia_test`;

  let owner: pg.Client | undefined;
  for (let i = 0; i < 15; i += 1) {
    owner = new pg.Client({ connectionString: ownerUrl });
    try {
      await owner.connect();
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      owner = undefined;
    }
  }
  if (!owner) {
    throw new Error("scratch postgres did not accept connections");
  }
  await owner.query(`CREATE ROLE juridico_app LOGIN PASSWORD 'juridico_app'`);
  await owner.query(`GRANT CONNECT ON DATABASE juridico_ia_test TO juridico_app`);
  await owner.end();

  const appUrl = `postgresql://juridico_app:juridico_app@${host}:${port}/juridico_ia_test`;

  return {
    ownerUrl,
    appUrl,
    host,
    port,
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
