import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { getCorrelationId, structuredLog } from "@juridico-ia/observability";
import type { Response } from "express";

@Catch()
export class FailClosedFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const correlationId = getCorrelationId();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const body = typeof payload === "object" && payload !== null ? payload : { message: String(payload) };
      res.status(status).json({ ...body, correlationId });
      return;
    }
    const code = (exception as { code?: string }).code;
    const expected = code === "VALIDATION_ERROR" || code === "ACCESS_DENIED" || code === "UNAUTHENTICATED";
    if (!expected) {
      structuredLog("error", "unhandled.exception", {
        err: exception instanceof Error ? exception.message : String(exception),
        code,
      });
    }
    if (code === "VALIDATION_ERROR") {
      res.status(HttpStatus.BAD_REQUEST).json({ code, message: "Entrada inválida", correlationId });
      return;
    }
    if (code === "ACCESS_DENIED") {
      res.status(HttpStatus.FORBIDDEN).json({ code, message: "Acesso restrito", correlationId });
      return;
    }
    if (code === "UNAUTHENTICATED") {
      res.status(HttpStatus.UNAUTHORIZED).json({ code, message: "Sessão inválida", correlationId });
      return;
    }
    if (code === "IDEMPOTENCY_CONFLICT" || code === "IDEMPOTENCY_IN_PROGRESS" || code === "IDEMPOTENCY_RACE") {
      res.status(HttpStatus.CONFLICT).json({ code, message: "Operação idempotente em conflito", correlationId });
      return;
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: "INTERNAL",
      message: "Falha interna",
      correlationId,
    });
  }
}
