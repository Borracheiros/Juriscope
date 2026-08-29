import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startScratchPostgres, type ScratchDb } from "@juridico-ia/testing";
import { checksumOf, MigrationChecksumError, pendingCount, runMigrations, schemaFingerprint } from "../src/database/migrator";
import { MIGRATIONS } from "../src/database/migrations";
import { fixtures, ids, seedSyntheticTenants, SYNTHETIC_PASSWORD } from "./fixtures";
import type { INestApplication } from "@nestjs/common";
import pg from "pg";
import { withTenantTx } from "../src/database/pool";
import { createPool } from "../src/database/pool";
import { createTestApp } from "./create-app";

function cookieHeader(setCookie: string[] | string | undefined): string {
  const parts = (Array.isArray(setCookie) ? setCookie : [setCookie ?? ""]).map((c) => c.split(";")[0] ?? "");
  return parts.join("; ");
}

function csrfFrom(setCookie: string[] | string | undefined): string {
  const raw = Array.isArray(setCookie) ? setCookie.join(";") : (setCookie ?? "");
  return raw.match(/jcsrf=([^;]+)/)?.[1] ?? "";
}

describe("foundation gap-closure", () => {
  let db: ScratchDb;
  let app: INestApplication;
  let owner: pg.Client;
  let appClosed = false;

  beforeAll(async () => {
    db = await startScratchPostgres();
    const empty = new pg.Client({ connectionString: db.ownerUrl });
    await empty.connect();
    const tables = await empty.query(`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'`);
    expect(tables.rows[0]?.n).toBe(0);
    await empty.end();
    const first = await runMigrations(db.ownerUrl);
    expect(first.pendingAfter).toBe(0);
    const second = await runMigrations(db.ownerUrl);
    expect(second.applied).toEqual([]);
    expect(await pendingCount(db.ownerUrl)).toBe(0);
    expect(schemaFingerprint().length).toBe(64);
    await seedSyntheticTenants(db.ownerUrl);
    owner = new pg.Client({ connectionString: db.ownerUrl });
    await owner.connect();
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = db.ownerUrl;
    process.env.DATABASE_APP_URL = db.appUrl;
    process.env.WORKER_DATABASE_URL = db.workerUrl;
    /* SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN */
    process.env.SESSION_SECRET = "test-session-secret-min-32-chars!!";
    /* SECRET_SCAN_ALLOW_SYNTHETIC_END */
    process.env.COOKIE_SECURE = "false";
    process.env.WEB_ORIGIN = "http://127.0.0.1:3000";
    app = await createTestApp();
  }, 120_000);

  afterAll(async () => {
    if (app && !appClosed) await app.close();
    await owner?.end();
    if (db) await db.stop();
  });

  it("enables pgvector and FORCE RLS without bypass", async () => {
    const ext = await owner.query(`SELECT extname FROM pg_extension WHERE extname='vector'`);
    expect(ext.rowCount).toBe(1);
    const role = await owner.query(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname='juridico_app'`,
    );
    expect(role.rows[0]?.rolsuper).toBe(false);
    expect(role.rows[0]?.rolbypassrls).toBe(false);
    const force = await owner.query(
      `SELECT c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
       WHERE n.nspname='public' AND c.relname='users'`,
    );
    expect(force.rows[0]?.relforcerowsecurity).toBe(true);
  });

  it("health is public and ready is 200", async () => {
    await request(app.getHttpServer()).get("/v1/health").expect(200);
    const ready = await request(app.getHttpServer()).get("/v1/ready").expect(200);
    expect(ready.body.database).toBe("up");
    expect(JSON.stringify(ready.body)).not.toMatch(/postgresql:\/\//);
  });

  it("rejects unauthenticated me", async () => {
    const res = await request(app.getHttpServer()).get("/v1/me").expect(401);
    expect(res.body.code).toBe("UNAUTHENTICATED");
    expect(JSON.stringify(res.body)).not.toMatch(/password|postgresql/i);
  });

  it("isolates tenants, authz, spoofing, foreign UUID, audit and idempotency", async () => {
    const loginA = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: fixtures.tenantA.email, password: SYNTHETIC_PASSWORD, tenantSlug: fixtures.tenantA.slug })
      .expect(200);
    const cookiesA = cookieHeader(loginA.headers["set-cookie"]);
    const csrfA = csrfFrom(loginA.headers["set-cookie"]);

    const loginB = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: fixtures.tenantB.email, password: SYNTHETIC_PASSWORD, tenantSlug: fixtures.tenantB.slug })
      .expect(200);
    const cookiesB = cookieHeader(loginB.headers["set-cookie"]);

    const auditA = await request(app.getHttpServer()).get("/v1/audit").set("Cookie", cookiesA).expect(200);
    const auditB = await request(app.getHttpServer()).get("/v1/audit").set("Cookie", cookiesB).expect(200);
    const overlap = (auditA.body as { id: string }[]).some((a) => (auditB.body as { id: string }[]).some((b) => b.id === a.id));
    expect(overlap).toBe(false);
    expect(JSON.stringify(auditA.body)).not.toMatch(/SyntheticPass|password_hash/i);

    const spoof = await request(app.getHttpServer())
      .get("/v1/me")
      .set("Cookie", cookiesA)
      .set("x-tenant-id", ids.tenantB);
    expect(spoof.status).toBe(403);

    const spoofQuery = await request(app.getHttpServer())
      .get("/v1/me")
      .query({ tenantId: ids.tenantB })
      .set("Cookie", cookiesA);
    expect(spoofQuery.status).toBe(403);

    const spoofBody = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfA)
      .set("Idempotency-Key", "spoof-body")
      .send({ n: 1, tenantId: ids.tenantB });
    expect(spoofBody.status).toBe(403);

    const lawyerDir = await request(app.getHttpServer()).get("/v1/directory/users").set("Cookie", cookiesA);
    expect(lawyerDir.status).toBe(403);
    expect(lawyerDir.body.code).toBe("ACCESS_DENIED");
    const denials = await request(app.getHttpServer()).get("/v1/audit").set("Cookie", cookiesA).expect(200);
    expect((denials.body as { action: string }[]).some((e) => e.action === "authorization.denied")).toBe(true);

    const adminLogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: fixtures.tenantA.adminEmail, password: SYNTHETIC_PASSWORD, tenantSlug: fixtures.tenantA.slug })
      .expect(200);
    const cookiesAdmin = cookieHeader(adminLogin.headers["set-cookie"]);
    const dir = await request(app.getHttpServer()).get("/v1/directory/users").set("Cookie", cookiesAdmin).expect(200);
    expect((dir.body as { email: string }[]).map((u) => u.email).join()).not.toContain("beta");

    const foreign = await request(app.getHttpServer())
      .get(`/v1/directory/users/${ids.userB}`)
      .set("Cookie", cookiesAdmin);
    expect(foreign.status).toBe(404);
    expect(foreign.body.message).toBe("Recurso indisponível");

    const hb1 = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfA)
      .set("Idempotency-Key", "hb-1")
      .send({ n: 1 })
      .expect(200);
    const hb2 = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfA)
      .set("Idempotency-Key", "hb-1")
      .send({ n: 1 })
      .expect(200);
    expect(hb2.body.auditId).toBe(hb1.body.auditId);

    const conflict = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfA)
      .set("Idempotency-Key", "hb-1")
      .send({ n: 2 });
    expect(conflict.status).toBe(409);

    const concurrent = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post("/v1/ops/heartbeat")
          .set("Cookie", cookiesA)
          .set("x-csrf-token", csrfA)
          .set("Idempotency-Key", "hb-10")
          .send({ batch: true }),
      ),
    );
    expect(concurrent.every((r) => r.status === 200)).toBe(true);
    const auditIds = new Set(concurrent.map((r) => r.body.auditId));
    expect(auditIds.size).toBe(1);
    const outbox = await owner.query(
      `SELECT count(*)::int AS n FROM outbox_events WHERE tenant_id = $1 AND payload->>'auditId' = $2`,
      [ids.tenantA, [...auditIds][0]],
    );
    expect(outbox.rows[0]?.n).toBe(1);

    const csrfB = csrfFrom(loginB.headers["set-cookie"]);
    const otherTenant = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesB)
      .set("x-csrf-token", csrfB)
      .set("Idempotency-Key", "hb-1")
      .send({ n: 1 })
      .expect(200);
    expect(otherTenant.body.auditId).not.toBe(hb1.body.auditId);
  });

  it("blocks cross-tenant writes and empty tenant context", async () => {
    const pool = createPool(db.appUrl);
    const empty = await pool.query("SELECT count(*)::int AS n FROM users");
    expect(empty.rows[0]?.n).toBe(0);
    await withTenantTx(pool, ids.tenantA, async (client) => {
      const upd = await client.query(`UPDATE users SET display_name='x' WHERE id = $1`, [ids.userB]);
      expect(upd.rowCount).toBe(0);
      const del = await client.query(`DELETE FROM users WHERE id = $1`, [ids.userB]);
      expect(del.rowCount).toBe(0);
      await expect(
        client.query(
          `INSERT INTO users (id, tenant_id, email, password_hash, display_name)
           VALUES (gen_random_uuid(), $1, 'intruder@example.test', 'x', 'x')`,
          [ids.tenantB],
        ),
      ).rejects.toMatchObject({ code: expect.stringMatching(/42501|23514|23503/) });
    });
    await withTenantTx(pool, ids.tenantA, async (client) => {
      const emails = await client.query<{ email: string }>(`SELECT email FROM users`);
      expect(emails.rows.every((r) => r.email.includes("alpha"))).toBe(true);
    });
    await withTenantTx(pool, ids.tenantB, async (client) => {
      const emails = await client.query<{ email: string }>(`SELECT email FROM users`);
      expect(emails.rows.every((r) => r.email.includes("beta"))).toBe(true);
    });
    await expect(
      owner.query(`INSERT INTO memberships (tenant_id, user_id, profile_id) VALUES ($1,$2,$3)`, [
        ids.tenantA,
        ids.userB,
        ids.profileA,
      ]),
    ).rejects.toMatchObject({ code: "23503" });
    await pool.end();
  });

  it("prevents audit mutation by app role", async () => {
    const pool = createPool(db.appUrl);
    await withTenantTx(pool, ids.tenantA, async (client) => {
      await expect(client.query(`UPDATE audit_events SET action='tamper'`)).rejects.toMatchObject({ code: "42501" });
    });
    await withTenantTx(pool, ids.tenantA, async (client) => {
      await expect(client.query(`DELETE FROM audit_events`)).rejects.toMatchObject({ code: "42501" });
    });
    await pool.end();
  });

  it("fails checksum mismatch closed", async () => {
    await owner.query(`UPDATE schema_migrations SET checksum = $1`, ["0".repeat(64)]);
    await expect(runMigrations(db.ownerUrl)).rejects.toBeInstanceOf(MigrationChecksumError);
    await owner.query(`UPDATE schema_migrations SET checksum = $1`, [checksumOf(MIGRATIONS[0]!.sql)]);
  });

  it("rolls back outbox with domain", async () => {
    await owner.query("BEGIN");
    await owner.query(
      `INSERT INTO outbox_events (tenant_id, event_type, payload) VALUES ($1,'X','{}')`,
      [ids.tenantA],
    );
    await owner.query("ROLLBACK");
    const n = await owner.query(
      `SELECT count(*)::int AS n FROM outbox_events WHERE event_type='X' AND tenant_id=$1`,
      [ids.tenantA],
    );
    expect(n.rows[0]?.n).toBe(0);
  });

  it("revokes access when user is suspended", async () => {
    const login = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: fixtures.tenantA.email, password: SYNTHETIC_PASSWORD, tenantSlug: fixtures.tenantA.slug })
      .expect(200);
    const cookies = cookieHeader(login.headers["set-cookie"]);
    await owner.query(`UPDATE users SET status='SUSPENDED' WHERE id=$1`, [ids.userA]);
    const me = await request(app.getHttpServer()).get("/v1/me").set("Cookie", cookies);
    expect(me.status).toBe(401);
    await owner.query(`UPDATE users SET status='ACTIVE' WHERE id=$1`, [ids.userA]);
  });

  it("ready returns 503 when database is down", async () => {
    await app.close();
    appClosed = true;
    process.env.DATABASE_APP_URL = "postgresql://juridico_app@127.0.0.1:1/none";
    const down = await createTestApp();
    const res = await request(down.getHttpServer()).get("/v1/ready");
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("NOT_READY");
    expect(JSON.stringify(res.body)).not.toMatch(/postgresql:\/\//);
    await down.close();
  });
});
