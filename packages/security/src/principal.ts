import { AsyncLocalStorage } from "node:async_hooks";
import type { Capability } from "@juridico-ia/contracts";

export type Principal = {
  userId: string;
  tenantId: string;
  profileId: string;
  profileCode: string;
  capabilities: readonly Capability[];
};

const als = new AsyncLocalStorage<Principal>();

export function runWithPrincipal<T>(principal: Principal, fn: () => T): T {
  return als.run(principal, fn);
}

export function currentPrincipal(): Principal | undefined {
  return als.getStore();
}

export function requirePrincipal(): Principal {
  const p = als.getStore();
  if (!p) {
    throw Object.assign(new Error("UNAUTHENTICATED"), { code: "UNAUTHENTICATED" });
  }
  return p;
}

export function hasCapability(principal: Principal, capability: Capability): boolean {
  return principal.capabilities.includes(capability);
}

export function assertCapability(principal: Principal, capability: Capability): void {
  if (!hasCapability(principal, capability)) {
    throw Object.assign(new Error("ACCESS_DENIED"), { code: "ACCESS_DENIED", capability });
  }
}

/** Tenant never comes from request body/query/header. */
export function rejectClientTenantClaim(claimed: string | undefined, sessionTenantId: string): void {
  if (claimed && claimed !== sessionTenantId) {
    throw Object.assign(new Error("TENANT_MISMATCH"), { code: "TENANT_MISMATCH" });
  }
}
