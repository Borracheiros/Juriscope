import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import cookieParser from "cookie-parser";
import type { INestApplication } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { FailClosedFilter } from "../src/http/fail-closed.filter";
import { CorrelationMiddleware } from "../src/http/correlation.middleware";

export async function createTestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("v1");
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => new CorrelationMiddleware().use(req, res, next));
  app.useGlobalFilters(new FailClosedFilter());
  await app.init();
  return app;
}
