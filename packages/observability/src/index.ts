import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

type Store = { correlationId: string };

const als = new AsyncLocalStorage<Store>();

export function newCorrelationId(): string {
  return randomUUID();
}

export function runWithCorrelation<T>(correlationId: string, fn: () => T): T {
  return als.run({ correlationId }, fn);
}

export function getCorrelationId(): string | undefined {
  return als.getStore()?.correlationId;
}

const REDACT = ["password", "token", "secret", "authorization", "cookie", "cpf", "prompt", "raw"];

export function structuredLog(level: "info" | "warn" | "error", message: string, fields: Record<string, unknown> = {}): void {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (REDACT.some((r) => k.toLowerCase().includes(r))) {
      safe[k] = "[redacted]";
    } else {
      safe[k] = v;
    }
  }
  const line = JSON.stringify({
    level,
    message,
    correlationId: getCorrelationId(),
    time: new Date().toISOString(),
    ...safe,
  });
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}
