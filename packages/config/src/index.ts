import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(3001),
  WEB_ORIGIN: z.string().default("http://127.0.0.1:3000"),
  DATABASE_URL: z.string().min(1),
  DATABASE_APP_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  LOG_LEVEL: z.string().default("info"),
});

export type AppEnv = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function runtimeDatabaseUrl(env: AppEnv): string {
  return env.DATABASE_APP_URL ?? env.DATABASE_URL;
}
