import { describe, expect, it } from "vitest";
import { ConfigError, loadApiEnv, loadMigratorEnv, loadWorkerEnv } from "./index";

/* SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN */
const secret = "test-session-secret-min-32-chars!!";
const ownerUrl = "postgresql://juridico@127.0.0.1:5432/juridico_ia";
const appUrl = "postgresql://juridico_app@127.0.0.1:5432/juridico_ia";
const ownerAsApp = "postgresql://juridico@127.0.0.1:5432/juridico_ia";
/* SECRET_SCAN_ALLOW_SYNTHETIC_END */

describe("fail-closed config", () => {
  it("rejects API boot without DATABASE_APP_URL", () => {
    expect(() =>
      loadApiEnv({
        SESSION_SECRET: secret,
        WEB_ORIGIN: "http://127.0.0.1:3000",
        DATABASE_URL: ownerUrl,
      }),
    ).toThrow(ConfigError);
  });

  it("rejects owner URL as API runtime", () => {
    expect(() =>
      loadApiEnv({
        SESSION_SECRET: secret,
        WEB_ORIGIN: "http://127.0.0.1:3000",
        DATABASE_APP_URL: ownerAsApp,
        DATABASE_URL: ownerUrl,
      }),
    ).toThrow(ConfigError);
  });

  it("rejects insecure production", () => {
    expect(() =>
      loadApiEnv({
        NODE_ENV: "production",
        SESSION_SECRET: secret,
        WEB_ORIGIN: "http://example.com",
        DATABASE_APP_URL: appUrl,
        COOKIE_SECURE: "false",
      }),
    ).toThrow(ConfigError);
  });

  it("migrator requires owner URL only", () => {
    expect(loadMigratorEnv({ DATABASE_URL: ownerUrl }).DATABASE_URL).toContain("juridico");
  });

  it("worker rejects owner user", () => {
    expect(() => loadWorkerEnv({ WORKER_DATABASE_URL: ownerUrl })).toThrow(ConfigError);
  });

  it("does not put DSN in config error message", () => {
    try {
      loadApiEnv({ SESSION_SECRET: secret, WEB_ORIGIN: "http://127.0.0.1:3000" });
      throw new Error("expected throw");
    } catch (err) {
      expect(String(err)).not.toMatch(/postgresql:\/\//);
      expect(String(err).toLowerCase()).not.toMatch(/juridico:juridico/);
    }
  });
});
