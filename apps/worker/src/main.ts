import { loadWorkerEnv } from "@juridico-ia/config";
import { structuredLog } from "@juridico-ia/observability";
import pg from "pg";
import { processOnce } from "./outbox";

async function main(): Promise<void> {
  const env = loadWorkerEnv(process.env);
  const pool = new pg.Pool({
    connectionString: env.WORKER_DATABASE_URL,
    max: 4,
    connectionTimeoutMillis: 3_000,
  });
  pool.on("error", () => undefined);

  let running = true;
  const stop = () => {
    running = false;
  };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);

  try {
    if (process.env.WORKER_LOOP === "1") {
      while (running) {
        await processOnce(pool, `worker-${process.pid}`);
        await new Promise((r) => setTimeout(r, 1_000));
      }
    } else {
      const n = await processOnce(pool, `worker-${process.pid}`);
      structuredLog("info", "worker.outbox.drained", { count: n });
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  structuredLog("error", "worker.failed", { err: err instanceof Error ? err.message : "error" });
  process.exit(1);
});
