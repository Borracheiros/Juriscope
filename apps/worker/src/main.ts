import { loadEnv } from "@juridico-ia/config";
import { structuredLog } from "@juridico-ia/observability";
import pg from "pg";
import { drainOutbox } from "./outbox";

async function main() {
  const env = loadEnv(process.env);
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const n = await drainOutbox(client);
    await client.query("COMMIT");
    structuredLog("info", "worker.outbox.drained", { count: n });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.env.WORKER_LOOP !== "1") {
  main().catch((err) => {
    structuredLog("error", "worker.failed", { err: String(err) });
    process.exit(1);
  });
}
