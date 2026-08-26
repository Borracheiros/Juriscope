import { Injectable, NestMiddleware } from "@nestjs/common";
import { newCorrelationId, runWithCorrelation } from "@juridico-ia/observability";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.header("x-correlation-id");
    const id = incoming && incoming.length <= 80 ? incoming : newCorrelationId();
    res.setHeader("x-correlation-id", id);
    runWithCorrelation(id, () => next());
  }
}
