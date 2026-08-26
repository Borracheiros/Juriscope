import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { startScratchPostgres, type ScratchDb } from "@juridico-ia/testing";
import { pendingCount, runMigrations, schemaFingerprint } from "../src/database/migrator";
import { fixtures, seedSyntheticTenants, SYNTHETIC_PASSWORD } from "./fixtures";
import type { INestApplication } from "@nestjs/common";
import pg from "pg";

function cookieHeader(setCookie: string[] | string | undefined): string {
  const parts = (Array.isArray(setCookie) ? setCookie : [setCookie ?? ""]).map((c) => c.split(";")[0] ?? "");
  return parts.join("; ");
}

function csrfFrom(setCookie: string[] | string | undefined): string {
  const raw = Array.isArray(setCookie) ? setCookie.join(";") : (setCookie ?? "");
  return raw.match(/jcsrf=([^;]+)/)?.[1] ?? "";
}

describe("foundation http + rls", () => {
  let db: ScratchDb;
  let app: INestApplication;

  beforeAll(async () => {
    db = await startScratchPostgres();
    const result = await runMigrations(db.ownerUrl);
    expect(result.pendingAfter).toBe(0);
    expect(await pendingCount(db.ownerUrl)).toBe(0);
    expect(schemaFingerprint().length).toBe(64);
    await seedSyntheticTenants(db.ownerUrl);
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = db.ownerUrl;
    process.env.DATABASE_APP_URL = db.appUrl;
    process.env.SESSION_SECRET = "test-session-secret-min-32-chars!!";
    process.env.COOKIE_SECURE = "false";
    process.env.WEB_ORIGIN = "http://127.0.0.1:3000";
    const { createTestApp } = await import("./create-app");
    app = await createTestApp();
  }, 120_000);

  afterAll(async () => {
    if (app) await app.close();
    if (db) await db.stop();
  });

  it("health is public", async () => {
    const res = await request(app.getHttpServer()).get("/v1/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.headers["cache-control"]).toBeUndefined();
  });

  it("rejects unauthenticated me", async () => {
    const res = await request(app.getHttpServer()).get("/v1/me").expect(401);
    expect(res.body.code).toBe("UNAUTHENTICATED");
    expect(res.body.message).not.toMatch(/sql|stack|password/i);
  });

  it("isolates tenants and enforces capabilities", async () => {
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
    const idsA = (auditA.body as { tenant_id?: string; action: string }[]).map((e) => e.action);
    expect(idsA).toContain("identity.login");

    const auditB = await request(app.getHttpServer()).get("/v1/audit").set("Cookie", cookiesB).expect(200);
    const actorOverlap = (auditA.body as { id: string }[]).some((a) =>
      (auditB.body as { id: string }[]).some((b) => b.id === a.id),
    );
    expect(actorOverlap).toBe(false);

    const lawyerDir = await request(app.getHttpServer()).get("/v1/directory/users").set("Cookie", cookiesA);
    expect(lawyerDir.status).toBe(403);
    expect(lawyerDir.body.code).toBe("ACCESS_DENIED");

    const adminLogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: fixtures.tenantA.adminEmail, password: SYNTHETIC_PASSWORD, tenantSlug: fixtures.tenantA.slug })
      .expect(200);
    const cookiesAdmin = cookieHeader(adminLogin.headers["set-cookie"]);
    const dir = await request(app.getHttpServer()).get("/v1/directory/users").set("Cookie", cookiesAdmin).expect(200);
    const emails = (dir.body as { email: string }[]).map((u) => u.email);
    expect(emails).toContain("lawyer.alpha@example.test");
    expect(emails.join()).not.toContain("beta");

    const hb1 = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfA ?? "")
      .set("Idempotency-Key", "hb-1")
      .expect(201);
    const hb2 = await request(app.getHttpServer())
      .post("/v1/ops/heartbeat")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfA ?? "")
      .set("Idempotency-Key", "hb-1")
      .expect(201);
    expect(hb2.body.auditId).toBe(hb1.body.auditId);
  });

  it("FORCE RLS blocks app role without tenant setting", async () => {
    const appClient = new pg.Client({ connectionString: db.appUrl });
    await appClient.connect();
    try {
      const rows = await appClient.query("SELECT count(*)::int AS n FROM users");
      expect(rows.rows[0]?.n).toBe(0);
    } finally {
      await appClient.end();
    }
  });
});
