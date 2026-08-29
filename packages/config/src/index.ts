import { z } from "zod";

export class ConfigError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ConfigError";
    this.code = code;
  }
}

function dsnUser(url: string): string {
  try {
    const normalized = url.replace(/^postgresql:/, "http:").replace(/^postgres:/, "http:");
    return new URL(normalized).username;
  } catch {
    throw new ConfigError("INVALID_DSN", "URL de banco inválida");
  }
}

function requireHttpsOrigin(origin: string): void {
  if (!origin.startsWith("https://")) {
    throw new ConfigError("INSECURE_ORIGIN", "WEB_ORIGIN de produção deve ser HTTPS");
  }
}

const base = {
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(3001),
  SESSION_SECRET: z.string().min(32),
  LOG_LEVEL: z.string().default("info"),
};

export type MigratorEnv = {
  NODE_ENV: "development" | "test" | "production";
  DATABASE_URL: string;
};

export function loadMigratorEnv(source: NodeJS.ProcessEnv = process.env): MigratorEnv {
  const parsed = z
    .object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      DATABASE_URL: z.string().min(1),
    })
    .safeParse(source);
  if (!parsed.success) {
    throw new ConfigError("MISSING_OWNER_DATABASE_URL", "DATABASE_URL do migrator é obrigatória");
  }
  return parsed.data;
}

export type ApiEnv = {
  NODE_ENV: "development" | "test" | "production";
  API_PORT: number;
  WEB_ORIGIN: string;
  DATABASE_APP_URL: string;
  SESSION_SECRET: string;
  COOKIE_SECURE: boolean;
  LOG_LEVEL: string;
};

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const parsed = z
    .object({
      ...base,
      WEB_ORIGIN: z.string().min(1),
      DATABASE_APP_URL: z.string().min(1),
      COOKIE_SECURE: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    })
    .safeParse(source);
  if (!parsed.success) {
    throw new ConfigError("MISSING_RUNTIME_DATABASE", "DATABASE_APP_URL da API é obrigatória");
  }
  const owner = source.DATABASE_URL;
  if (owner && parsed.data.DATABASE_APP_URL === owner) {
    throw new ConfigError("OWNER_USED_AS_RUNTIME", "API não pode usar a credencial owner");
  }
  if (owner && dsnUser(parsed.data.DATABASE_APP_URL) === dsnUser(owner)) {
    throw new ConfigError("OWNER_USED_AS_RUNTIME", "API não pode usar o usuário owner no runtime");
  }
  if (dsnUser(parsed.data.DATABASE_APP_URL) === "juridico") {
    throw new ConfigError("OWNER_USED_AS_RUNTIME", "API não aceita usuário owner no runtime");
  }
  if (parsed.data.NODE_ENV === "production") {
    if (!parsed.data.COOKIE_SECURE) {
      throw new ConfigError("INSECURE_COOKIE", "COOKIE_SECURE=true é obrigatório em produção");
    }
    requireHttpsOrigin(parsed.data.WEB_ORIGIN);
  }
  return {
    ...parsed.data,
    COOKIE_SECURE: Boolean(parsed.data.COOKIE_SECURE),
  };
}

export type WorkerEnv = {
  NODE_ENV: "development" | "test" | "production";
  WORKER_DATABASE_URL: string;
  LOG_LEVEL: string;
};

export function loadWorkerEnv(source: NodeJS.ProcessEnv = process.env): WorkerEnv {
  const parsed = z
    .object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      WORKER_DATABASE_URL: z.string().min(1),
      LOG_LEVEL: z.string().default("info"),
    })
    .safeParse(source);
  if (!parsed.success) {
    throw new ConfigError("MISSING_WORKER_DATABASE", "WORKER_DATABASE_URL é obrigatória");
  }
  if (dsnUser(parsed.data.WORKER_DATABASE_URL) === "juridico") {
    throw new ConfigError("OWNER_USED_AS_WORKER", "Worker não pode usar a credencial owner");
  }
  return parsed.data;
}

/** @deprecated use loadApiEnv / loadMigratorEnv / loadWorkerEnv */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  return loadApiEnv(source);
}

export function runtimeDatabaseUrl(env: ApiEnv): string {
  return env.DATABASE_APP_URL;
}
