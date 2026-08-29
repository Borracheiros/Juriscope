import { Injectable } from "@nestjs/common";
import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type pg from "pg";

export type SessionClaims = {
  userId: string;
  tenantId: string;
};

@Injectable()
export class IdentityService {
  constructor(
    private readonly pool: pg.Pool,
    private readonly sessionSecret: Uint8Array,
  ) {}

  async login(email: string, password: string, tenantSlug: string): Promise<SessionClaims & { displayName: string; tenantSlug: string; profileId: string; profileCode: string }> {
    const found = await this.pool.query(
      `SELECT user_id, tenant_id, password_hash, profile_id, profile_code, display_name, tenant_slug
       FROM app_private.find_login($1, $2)`,
      [email, tenantSlug],
    );
    const row = found.rows[0] as
      | {
          user_id: string;
          tenant_id: string;
          password_hash: string;
          profile_id: string;
          profile_code: string;
          display_name: string;
          tenant_slug: string;
        }
      | undefined;
    if (!row) {
      throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });
    }
    const ok = await compare(password, row.password_hash);
    if (!ok) {
      throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });
    }
    return {
      userId: row.user_id,
      tenantId: row.tenant_id,
      profileId: row.profile_id,
      profileCode: row.profile_code,
      displayName: row.display_name,
      tenantSlug: row.tenant_slug,
    };
  }

  async signSession(claims: SessionClaims): Promise<string> {
    return new SignJWT({ tenantId: claims.tenantId })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.userId)
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(this.sessionSecret);
  }

  async verifySession(token: string): Promise<SessionClaims> {
    const { payload } = await jwtVerify(token, this.sessionSecret);
    const userId = payload.sub;
    const tenantId = payload.tenantId;
    if (typeof userId !== "string" || typeof tenantId !== "string") {
      throw Object.assign(new Error("UNAUTHENTICATED"), { code: "UNAUTHENTICATED" });
    }
    return { userId, tenantId };
  }
}
