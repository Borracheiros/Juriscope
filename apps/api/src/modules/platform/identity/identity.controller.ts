import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { loginRequestSchema } from "@juridico-ia/contracts";
import type { Capability } from "@juridico-ia/contracts";
import { PROFILE_CAPABILITIES, type AccessProfileCode } from "@juridico-ia/contracts";
import { assertCapability, type Principal } from "@juridico-ia/security";
import { getCorrelationId } from "@juridico-ia/observability";
import type { Request, Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import { IdentityService } from "./identity.service";
import { withTenantTx } from "../../../database/pool";
import type pg from "pg";

const COOKIE = "jid";
const CSRF = "jcsrf";

@Controller()
export class IdentityController {
  constructor(
    @Inject(IdentityService) private readonly identity: IdentityService,
    @Inject("PG_POOL") private readonly pool: pg.Pool,
    @Inject("COOKIE_SECURE") private readonly cookieSecure: boolean,
  ) {}

  @Get("health")
  health() {
    return { status: "ok" as const, service: "api" };
  }

  @Get("ready")
  async ready() {
    try {
      await this.pool.query("SELECT 1");
      return { status: "ok" as const, database: "up" as const };
    } catch {
      return { status: "degraded" as const, database: "down" as const };
    }
  }

  @Post("auth/login")
  @HttpCode(200)
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const parsed = loginRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw Object.assign(new Error("VALIDATION_ERROR"), { code: "VALIDATION_ERROR" });
    }
    try {
      const session = await this.identity.login(parsed.data.email, parsed.data.password, parsed.data.tenantSlug);
      const token = await this.identity.signSession(session);
      const csrf = randomBytes(24).toString("hex");
      this.setAuthCookies(res, token, csrf);
      await withTenantTx(this.pool, session.tenantId, async (client) => {
        await client.query(
          `INSERT INTO audit_events (tenant_id, actor_user_id, action, entity, entity_id, correlation_id, metadata)
           VALUES ($1,$2,'identity.login','user',$3,$4,$5)`,
          [session.tenantId, session.userId, session.userId, getCorrelationId() ?? null, JSON.stringify({ tenantSlug: session.tenantSlug })],
        );
      });
      return {
        userId: session.userId,
        tenantId: session.tenantId,
        tenantSlug: session.tenantSlug,
        displayName: session.displayName,
        profileCode: session.profileCode,
        capabilities: session.capabilities,
      };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "INVALID_CREDENTIALS") {
        throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "Credenciais inválidas" });
      }
      throw err;
    }
  }

  @Post("auth/logout")
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: "/" });
    res.clearCookie(CSRF, { path: "/" });
  }

  @Get("me")
  async me(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    return {
      userId: principal.userId,
      tenantId: principal.tenantId,
      tenantSlug: undefined,
      displayName: undefined,
      profileCode: principal.profileCode,
      capabilities: principal.capabilities,
    };
  }

  @Get("directory/users")
  async listUsers(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    try {
      assertCapability(principal, "admin:manage");
    } catch {
      throw new ForbiddenException({ code: "ACCESS_DENIED", message: "Acesso restrito" });
    }
    return withTenantTx(this.pool, principal.tenantId, async (client) => {
      const rows = await client.query<{ id: string; email: string; display_name: string }>(
        `SELECT id, email, display_name FROM users ORDER BY email`,
      );
      return rows.rows;
    });
  }

  @Get("audit")
  async listAudit(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    try {
      assertCapability(principal, "audit:read");
    } catch {
      throw new ForbiddenException({ code: "ACCESS_DENIED", message: "Acesso restrito" });
    }
    return withTenantTx(this.pool, principal.tenantId, async (client) => {
      const rows = await client.query(
        `SELECT id, action, entity, entity_id, correlation_id, created_at
         FROM audit_events ORDER BY created_at DESC LIMIT 50`,
      );
      return rows.rows;
    });
  }

  @Post("ops/heartbeat")
  async heartbeat(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    this.assertCsrf(req);
    const key = req.header("idempotency-key");
    const operation = "ops.heartbeat";
    return withTenantTx(this.pool, principal.tenantId, async (client) => {
      if (key) {
        const existing = await client.query(
          `SELECT response_body, response_status FROM idempotency_keys
           WHERE tenant_id = $1 AND operation = $2 AND key = $3`,
          [principal.tenantId, operation, key],
        );
        if (existing.rows[0]) {
          return existing.rows[0].response_body;
        }
      }
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO audit_events (tenant_id, actor_user_id, action, entity, entity_id, correlation_id, after_state)
         VALUES ($1,$2,'ops.heartbeat','session',$3,$4,$5) RETURNING id`,
        [principal.tenantId, principal.userId, principal.userId, getCorrelationId() ?? null, JSON.stringify({ ok: true })],
      );
      await client.query(
        `INSERT INTO outbox_events (tenant_id, event_type, payload)
         VALUES ($1, 'SessionHeartbeat', $2)`,
        [principal.tenantId, JSON.stringify({ auditId: inserted.rows[0]?.id })],
      );
      const body = { ok: true, auditId: inserted.rows[0]?.id };
      if (key) {
        const requestHash = createHash("sha256").update(key).digest("hex");
        await client.query(
          `INSERT INTO idempotency_keys (tenant_id, key, operation, request_hash, response_status, response_body)
           VALUES ($1,$2,$3,$4,200,$5)`,
          [principal.tenantId, key, operation, requestHash, JSON.stringify(body)],
        );
      }
      return body;
    });
  }

  private setAuthCookies(res: Response, token: string, csrf: string) {
    const base = { httpOnly: true, sameSite: "lax" as const, secure: this.cookieSecure, path: "/" };
    res.cookie(COOKIE, token, { ...base, httpOnly: true });
    res.cookie(CSRF, csrf, { ...base, httpOnly: false });
  }

  private assertCsrf(req: Request) {
    const cookie = req.cookies?.[CSRF];
    const header = req.header("x-csrf-token");
    if (!cookie || !header || cookie !== header) {
      throw new ForbiddenException({ code: "CSRF", message: "CSRF inválido" });
    }
  }

  private async requirePrincipal(req: Request): Promise<Principal> {
    const token = req.cookies?.[COOKIE];
    if (!token) {
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Sessão ausente" });
    }
    try {
      const claims = await this.identity.verifySession(token);
      const capabilities = [...(PROFILE_CAPABILITIES[claims.profileCode as AccessProfileCode] ?? [])] as Capability[];
      return {
        userId: claims.userId,
        tenantId: claims.tenantId,
        profileId: claims.profileId,
        profileCode: claims.profileCode,
        capabilities,
      };
    } catch {
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Sessão inválida" });
    }
  }
}
