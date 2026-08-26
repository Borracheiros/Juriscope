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
    structuredLog("error", "unhandled.exception", {
      err: exception instanceof Error ? exception.message : String(exception),
      code,
    });
    if (code === "VALIDATION_ERROR") {
      res.status(HttpStatus.BAD_REQUEST).json({ code, message: "Entrada inválida", correlationId });
      return;
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: "INTERNAL",
      message: "Falha interna",
      correlationId,
    });
  }
}
