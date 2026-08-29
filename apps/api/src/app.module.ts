import { Inject, Injectable, Module, OnModuleDestroy } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER } from "@nestjs/core";
import { loadApiEnv, runtimeDatabaseUrl } from "@juridico-ia/config";
import { IdentityController } from "./modules/platform/identity/identity.controller";
import { HealthController } from "./modules/platform/health/health.controller";
import { IdentityService } from "./modules/platform/identity/identity.service";
import { createPool } from "./database/pool";
import { ModuleSkeletonsModule } from "./modules/skeletons.module";
import { FailClosedFilter } from "./http/fail-closed.filter";
import type pg from "pg";

@Injectable()
class PoolCloser implements OnModuleDestroy {
  constructor(@Inject("PG_POOL") private readonly pool: pg.Pool) {}
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

@Module({
  imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 60 }] }), ModuleSkeletonsModule],
  controllers: [HealthController, IdentityController],
  providers: [
    {
      provide: "PG_POOL",
      useFactory: () => {
        const env = loadApiEnv(process.env);
        const pool = createPool(runtimeDatabaseUrl(env));
        pool.on("error", () => undefined);
        return pool;
      },
    },
    {
      provide: "COOKIE_SECURE",
      useFactory: () => Boolean(loadApiEnv(process.env).COOKIE_SECURE),
    },
    {
      provide: IdentityService,
      useFactory: (pool: ReturnType<typeof createPool>) => {
        const env = loadApiEnv(process.env);
        return new IdentityService(pool, new TextEncoder().encode(env.SESSION_SECRET));
      },
      inject: ["PG_POOL"],
    },
    { provide: APP_FILTER, useClass: FailClosedFilter },
    PoolCloser,
  ],
})
export class AppModule {}
