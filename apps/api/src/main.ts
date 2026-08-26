import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { loadEnv } from "@juridico-ia/config";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { CorrelationMiddleware } from "./http/correlation.middleware";
import { structuredLog } from "@juridico-ia/observability";

async function bootstrap() {
  const env = loadEnv(process.env);
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn"] });
  app.setGlobalPrefix("v1");
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: env.NODE_ENV === "production",
      noSniff: true,
    }),
  );
  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  });
  app.use((req: Request, res: Response, next: NextFunction) => new CorrelationMiddleware().use(req, res, next));
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  await app.listen(env.API_PORT, "127.0.0.1");
  structuredLog("info", "api.started", { port: env.API_PORT });
}

bootstrap();
