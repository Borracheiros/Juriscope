import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import pg from "pg";
import { startScratchPostgres, type ScratchDb } from "@juridico-ia/testing";
import { runMigrations } from "../../api/src/database/migrator";
import {
  createDispatcher,
  processOnce,
  sessionHeartbeatHandler,
  type OutboxHandler,
  type OutboxRecord,
} from "../src/outbox";

const TENANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("outbox worker with explicit handlers", () => {
  let db: ScratchDb;
  let owner: pg.Client;

  beforeAll(async () => {
    db = await startScratchPostgres();
    await runMigrations(db.ownerUrl);
    owner = new pg.Client({ connectionString: db.ownerUrl });
    await owner.connect();
    await owner.query(`INSERT INTO tenants (id, slug, name) VALUES ($1, 't-outbox', 'T')`, [TENANT]);
  }, 120_000);

  beforeEach(async () => {
    await owner.query(`DELETE FROM outbox_effects`);
    await owner.query(`DELETE FROM outbox_events`);
  });

  afterAll(async () => {
    await owner?.end();
    await db?.stop();
  });

  async function insertPending(payload: object = { auditId: "audit-1" }): Promise<string> {
    const row = await owner.query<{ id: string }>(
      `INSERT INTO outbox_events (tenant_id, event_type, payload, status, correlation_id)
       VALUES ($1, 'SessionHeartbeat', $2::jsonb, 'PENDING', 'corr-1')
       RETURNING id`,
      [TENANT, JSON.stringify(payload)],
    );
    return row.rows[0]!.id;
  }

  function workerPool(): pg.Pool {
    const pool = new pg.Pool({ connectionString: db.workerUrl, max: 4 });
    pool.on("error", () => undefined);
    return pool;
  }

  it("two workers produce a single effect and one PUBLISHED", async () => {
    const id = await insertPending({ auditId: "shared" });
    const pool = workerPool();
    const [a, b] = await Promise.all([processOnce(pool, "w1", { limit: 1 }), processOnce(pool, "w2", { limit: 1 })]);
    expect(a + b).toBe(1);
    const published = await owner.query(`SELECT status FROM outbox_events WHERE id = $1`, [id]);
    expect(published.rows[0]?.status).toBe("PUBLISHED");
    const effects = await owner.query(`SELECT count(*)::int AS n FROM outbox_effects WHERE outbox_id = $1`, [id]);
    expect(effects.rows[0]?.n).toBe(1);
    const orphan = await owner.query(
      `SELECT count(*)::int AS n FROM outbox_events o
       WHERE o.status = 'PUBLISHED'
         AND NOT EXISTS (SELECT 1 FROM outbox_effects e WHERE e.outbox_id = o.id)`,
    );
    expect(orphan.rows[0]?.n).toBe(0);
    await pool.end();
  });

  it("handler failure does not mark PUBLISHED and schedules backoff", async () => {
    const id = await insertPending({ auditId: "fail-1" });
    const failing: OutboxHandler = async () => {
      throw new Error("handler_boom");
    };
    const pool = workerPool();
    const n = await processOnce(pool, "w-fail", {
      limit: 1,
      dispatcher: createDispatcher({ SessionHeartbeat: failing }),
    });
    expect(n).toBe(0);
    const row = await owner.query<{ status: string; locked_until: Date | null; last_error: string | null }>(
      `SELECT status, locked_until, last_error FROM outbox_events WHERE id = $1`,
      [id],
    );
    expect(row.rows[0]?.status).toBe("PENDING");
    expect(row.rows[0]?.locked_until).not.toBeNull();
    expect(row.rows[0]?.last_error).toContain("handler_boom");
    const effects = await owner.query(`SELECT count(*)::int AS n FROM outbox_effects WHERE outbox_id = $1`, [id]);
    expect(effects.rows[0]?.n).toBe(0);
    // Still within backoff window → not claimable
    const again = await processOnce(pool, "w-fail-2", {
      limit: 1,
      dispatcher: createDispatcher({ SessionHeartbeat: failing }),
    });
    expect(again).toBe(0);
    await pool.end();
  });

  it("reaches FAILED_PERMANENT after attempt limit without effect", async () => {
    const id = await insertPending({ auditId: "term" });
    await owner.query(`UPDATE outbox_events SET attempt_count = 7, locked_until = NULL, status = 'PENDING' WHERE id = $1`, [
      id,
    ]);
    const failing: OutboxHandler = async () => {
      throw new Error("always_fail");
    };
    const pool = workerPool();
    await processOnce(pool, "w-term", {
      limit: 1,
      dispatcher: createDispatcher({ SessionHeartbeat: failing }),
    });
    const row = await owner.query(`SELECT status, attempt_count FROM outbox_events WHERE id = $1`, [id]);
    expect(row.rows[0]?.status).toBe("FAILED_PERMANENT");
    expect(row.rows[0]?.attempt_count).toBe(8);
    const effects = await owner.query(`SELECT count(*)::int AS n FROM outbox_effects WHERE outbox_id = $1`, [id]);
    expect(effects.rows[0]?.n).toBe(0);
    await pool.end();
  });

  it("reclaims expired lease and completes with effect", async () => {
    const id = await insertPending({ auditId: "lease" });
    await owner.query(
      `UPDATE outbox_events
       SET status = 'PROCESSING', locked_by = 'dead-worker', locked_until = now() - interval '1 second', attempt_count = 1
       WHERE id = $1`,
      [id],
    );
    const pool = workerPool();
    const n = await processOnce(pool, "w-lease", { limit: 1 });
    expect(n).toBe(1);
    const row = await owner.query(`SELECT status, locked_by FROM outbox_events WHERE id = $1`, [id]);
    expect(row.rows[0]?.status).toBe("PUBLISHED");
    expect(row.rows[0]?.locked_by).toBeNull();
    const effects = await owner.query(`SELECT count(*)::int AS n FROM outbox_effects WHERE outbox_id = $1`, [id]);
    expect(effects.rows[0]?.n).toBe(1);
    await pool.end();
  });

  it("retry after failure then succeeds with single effect", async () => {
    const id = await insertPending({ auditId: "retry" });
    let calls = 0;
    const flaky: OutboxHandler = async (client, event: OutboxRecord) => {
      calls += 1;
      if (calls === 1) throw new Error("transient");
      await sessionHeartbeatHandler(client, event);
    };
    const pool = workerPool();
    const first = await processOnce(pool, "w-retry-1", {
      limit: 1,
      dispatcher: createDispatcher({ SessionHeartbeat: flaky }),
    });
    expect(first).toBe(0);
    await owner.query(`UPDATE outbox_events SET locked_until = NULL WHERE id = $1`, [id]);
    const second = await processOnce(pool, "w-retry-2", {
      limit: 1,
      dispatcher: createDispatcher({ SessionHeartbeat: flaky }),
    });
    expect(second).toBe(1);
    const effects = await owner.query(`SELECT count(*)::int AS n FROM outbox_effects WHERE outbox_id = $1`, [id]);
    expect(effects.rows[0]?.n).toBe(1);
    await pool.end();
  });
});
