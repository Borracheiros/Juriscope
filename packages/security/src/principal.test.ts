import { describe, expect, it } from "vitest";
import { assertCapability, rejectClientTenantClaim, type Principal } from "./principal";

const principal: Principal = {
  userId: "00000000-0000-4000-8000-000000000001",
  tenantId: "00000000-0000-4000-8000-0000000000aa",
  profileId: "00000000-0000-4000-8000-0000000000bb",
  profileCode: "readonly",
  capabilities: ["client:read"],
};

describe("authorization", () => {
  it("fail-closed without grant", () => {
    expect(() => assertCapability(principal, "admin:manage")).toThrow(/ACCESS_DENIED/);
  });

  it("rejects tenant spoofing", () => {
    expect(() => rejectClientTenantClaim("other", principal.tenantId)).toThrow(/TENANT_MISMATCH/);
  });
});
