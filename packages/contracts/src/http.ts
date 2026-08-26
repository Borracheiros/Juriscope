import { z } from "zod";

export const errorEnvelopeSchema = z.object({
  code: z.string(),
  message: z.string(),
  correlationId: z.string().optional(),
});

export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantSlug: z.string().min(2).max(80),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sessionResponseSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  tenantSlug: z.string(),
  displayName: z.string(),
  profileCode: z.string(),
  capabilities: z.array(z.string()),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
});

export const readyResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  database: z.enum(["up", "down"]),
});
