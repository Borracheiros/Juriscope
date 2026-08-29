import { describe, expect, it } from "vitest";
import { sanitizeMetadata } from "./audit.repository";

describe("sanitizeMetadata recursive", () => {
  it("removes nested forbidden keys including arrays", () => {
    /* SECRET_SCAN_ALLOW_SYNTHETIC_BEGIN */
    const input = {
      ok: true,
      nested: {
        password: "secret-value",
        token: "tok",
        cookie: "c",
        secret: "s",
        prompt: "p",
        authorization: "Bearer x",
        cpf: "12345678901",
        safe: "keep",
        deeper: [{ password: "x", note: "y" }, { token: "t", id: 1 }],
      },
      list: [{ cookie: "a" }, { name: "ok" }],
    };
    /* SECRET_SCAN_ALLOW_SYNTHETIC_END */
    const out = sanitizeMetadata(input) as Record<string, unknown>;
    expect(out.ok).toBe(true);
    const nested = out.nested as Record<string, unknown>;
    expect(nested.safe).toBe("keep");
    expect(nested.password).toBeUndefined();
    expect(nested.token).toBeUndefined();
    expect(nested.cookie).toBeUndefined();
    expect(nested.secret).toBeUndefined();
    expect(nested.prompt).toBeUndefined();
    expect(nested.authorization).toBeUndefined();
    expect(nested.cpf).toBeUndefined();
    const deeper = nested.deeper as Record<string, unknown>[];
    expect(deeper[0]).toEqual({ note: "y" });
    expect(deeper[1]).toEqual({ id: 1 });
    const list = out.list as Record<string, unknown>[];
    expect(list[0]).toEqual({});
    expect(list[1]).toEqual({ name: "ok" });
  });

  it("truncates long strings", () => {
    const out = sanitizeMetadata({ note: "x".repeat(250) }) as { note: string };
    expect(out.note).toBe("[truncated]");
  });
});
