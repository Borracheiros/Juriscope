import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  HttpException,
} from "@nestjs/common";
import { loginRequestSchema } from "@juridico-ia/contracts";
import { rejectClientTenantClaim, type Principal } from "@juridico-ia/security";
import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { IdentityService } from "./identity.service";
import { withTenantTx } from "../../../database/pool";
import { insertAudit } from "../audit/audit.repository";
import { denyIfUnauthorized, resolvePrincipal } from "../authorization/authorization.service";
import { canonicalHash, IdempotencyConflictError } from "../idempotency/idempotency.service";
import { runHeartbeat } from "../ops/heartbeat.use-case";
import type pg from "pg";

const COOKIE = "jid";
const CSRF = "jcsrf";

function rejectSpoofedTenant(req: Request, sessionTenantId?: string) {
  const claimed =
    (typeof req.body === "object" && req.body && "tenantId" in req.body ? String((req.body as { tenantId?: string }).tenantId) : undefined) ||
    (typeof req.query.tenantId === "string" ? req.query.tenantId : undefined) ||
    req.header("x-tenant-id") ||
    undefined;
  if (!claimed) return;
  if (!sessionTenantId || claimed !== sessionTenantId) {
    throw new ForbiddenException({ code: "TENANT_CLAIM_REJECTED", message: "Tenant no pedido foi rejeitado" });
  }
  if (sessionTenantId) {
    rejectClientTenantClaim(claimed, sessionTenantId);
  }
}

@Controller()
export class IdentityController {
  constructor(
    @Inject(IdentityService) private readonly identity: IdentityService,
    @Inject("PG_POOL") private readonly pool: pg.Pool,
    @Inject("COOKIE_SECURE") private readonly cookieSecure: boolean,
  ) {}

  @Post("auth/login")
  @HttpCode(200)
  async login(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    rejectSpoofedTenant(req);
    const parsed = loginRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw Object.assign(new Error("VALIDATION_ERROR"), { code: "VALIDATION_ERROR" });
    }
    try {
      const session = await this.identity.login(parsed.data.email, parsed.data.password, parsed.data.tenantSlug);
      const token = await this.identity.signSession({ userId: session.userId, tenantId: session.tenantId });
      const csrf = randomBytes(24).toString("hex");
      this.setAuthCookies(res, token, csrf);
      const principal = await withTenantTx(this.pool, session.tenantId, async (client) => {
        await insertAudit(client, {
          tenantId: session.tenantId,
          actorUserId: session.userId,
          action: "identity.login",
          entity: "user",
          entityId: session.userId,
          result: "SUCCESS",
          origin: "password",
        });
        return resolvePrincipal(client, session);
      });
      return {
        userId: session.userId,
        tenantId: session.tenantId,
        tenantSlug: session.tenantSlug,
        displayName: session.displayName,
        profileCode: principal.profileCode,
        capabilities: principal.capabilities,
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const principal = await this.requirePrincipal(req);
      await withTenantTx(this.pool, principal.tenantId, async (client) => {
        await insertAudit(client, {
          tenantId: principal.tenantId,
          actorUserId: principal.userId,
          action: "identity.logout",
          entity: "session",
          entityId: principal.userId,
          result: "SUCCESS",
        });
      });
    } catch {
      /* logout is best-effort */
    }
    res.clearCookie(COOKIE, { path: "/" });
    res.clearCookie(CSRF, { path: "/" });
  }

  @Get("me")
  async me(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    rejectSpoofedTenant(req, principal.tenantId);
    return {
      userId: principal.userId,
      tenantId: principal.tenantId,
      profileCode: principal.profileCode,
      capabilities: principal.capabilities,
    };
  }

  @Get("directory/users")
  async listUsers(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    rejectSpoofedTenant(req, principal.tenantId);
    await denyIfUnauthorized(this.pool, principal, "admin:manage", "user");
    return withTenantTx(this.pool, principal.tenantId, async (client) => {
      const rows = await client.query<{ id: string; email: string; display_name: string }>(
        `SELECT id, email, display_name FROM users ORDER BY email`,
      );
      return rows.rows;
    });
  }

  @Get("directory/users/:id")
  async getUser(@Req() req: Request, @Param("id") id: string) {
    const principal = await this.requirePrincipal(req);
    rejectSpoofedTenant(req, principal.tenantId);
    await denyIfUnauthorized(this.pool, principal, "admin:manage", "user");
    return withTenantTx(this.pool, principal.tenantId, async (client) => {
      const rows = await client.query(`SELECT id, email, display_name FROM users WHERE id = $1`, [id]);
      if (!rows.rows[0]) {
        throw new NotFoundException({ code: "NOT_FOUND", message: "Recurso indisponível" });
      }
      return rows.rows[0];
    });
  }

  @Get("audit")
  async listAudit(@Req() req: Request) {
    const principal = await this.requirePrincipal(req);
    rejectSpoofedTenant(req, principal.tenantId);
    await denyIfUnauthorized(this.pool, principal, "audit:read", "audit");
    return withTenantTx(this.pool, principal.tenantId, async (client) => {
      const rows = await client.query(
        `SELECT id, action, entity, entity_id, result, correlation_id, created_at
         FROM audit_events ORDER BY created_at DESC LIMIT 50`,
      );
      return rows.rows;
    });
  }

  @Post("ops/heartbeat")
  @HttpCode(200)
  async heartbeat(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const principal = await this.requirePrincipal(req);
    rejectSpoofedTenant(req, principal.tenantId);
    this.assertCsrf(req);
    const key = req.header("idempotency-key");
    const hash = canonicalHash("POST", "/v1/ops/heartbeat", req.body ?? {});
    try {
      const result = await withTenantTx(this.pool, principal.tenantId, async (client) =>
        runHeartbeat(client, principal, key, hash),
      );
      res.status(result.status);
      return result.body;
    } catch (err) {
      if (err instanceof IdempotencyConflictError) {
        throw new ConflictException({ code: err.code, message: "Chave idempotente incompatível" });
      }
      throw err;
    }
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
      return withTenantTx(this.pool, claims.tenantId, (client) => resolvePrincipal(client, claims));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new UnauthorizedException({ code: "UNAUTHENTICATED", message: "Sessão inválida" });
    }
  }
}
