import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { AppLoggingService } from "src/core/logging/services/logging.service";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    this.logger.error(
      `🚨 Unhandled Exception: ${status} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
      HttpExceptionFilter.name,
    );

    const errorResponse = {
      errors: [
        {
          status: status.toString(),
          title: HttpStatus[status] || "Unknown Error",
          detail: typeof message === "string" ? message : (message as any)?.message || "An error occurred",
          source: {
            pointer: request.url,
          },
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          },
        },
      ],
    };

    response.status(status).send(errorResponse);
  }
}
