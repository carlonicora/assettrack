import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { catchError, Observable, tap, throwError } from "rxjs";
import { LogContext } from "../interfaces/logging.interface";
import { AppLoggingService } from "../services/logging.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: AppLoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    // Store start time and context on the raw request for the onSend hook
    (request as any).raw['requestStartTime'] = startTime;

    // Extract request details
    const requestId = (request.headers["x-request-id"] as string) || request.id;
    const requestPath = request.url;
    const requestMethod = request.method;
    const userIp = request.ip;
    const userAgent = request.headers["user-agent"];

    // Set up request context for logging with trace correlation
    const logContext: LogContext = {
      requestId,
      ip: userIp,
      userAgent,
      method: requestMethod,
      url: requestPath,
    };

    // Set context in ClsService for the entire request lifecycle
    this.loggingService.setRequestContext(logContext);

    return next.handle().pipe(
      tap(() => {
        // Success logging and context clearing are now handled in the onSend hook for accurate timing
        // Nothing to do here for successful requests
      }),
      catchError((error) => {
        const statusCode = error.status || error.statusCode || 500;
        const responseTime = Date.now() - startTime;

        // Log error with structured logging (errors don't go through onSend hook)
        this.loggingService.logHttpError(requestMethod, requestPath, error, responseTime, userIp);

        // Enhanced error logging
        this.loggingService.errorWithContext(`❌ Request failed`, error, "HTTP_ERROR", {
          responseTime,
          statusCode,
          errorCode: error.code,
          errorType: error.constructor.name,
        });

        // Clear context after error
        this.loggingService.clearRequestContext();

        return throwError(() => error);
      }),
    );
  }
}
