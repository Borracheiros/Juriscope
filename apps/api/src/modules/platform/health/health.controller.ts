import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import type pg from "pg";

@Controller()
export class HealthController {
  constructor(@Inject("PG_POOL") private readonly pool: pg.Pool) {}

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
      throw new ServiceUnavailableException({ code: "NOT_READY", message: "Dependência indisponível" });
    }
  }
}
