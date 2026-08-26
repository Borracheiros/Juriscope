import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import cookieParser from "cookie-parser";
import type { INestApplication } from "@nestjs/common";
import { FailClosedFilter } from "../src/http/fail-closed.filter";

export async function createTestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("v1");
  app.use(cookieParser());
  app.useGlobalFilters(new FailClosedFilter());
  await app.init();
  return app;
}
