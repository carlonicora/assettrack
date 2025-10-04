import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClsService } from "nestjs-cls";
import pino from "pino";
import pretty from "pino-pretty";
import { ConfigLoggingInterface } from "src/common/config/interfaces/config.logging.interface";
import { TracingService } from "src/core/tracing/services/tracing.service";
import { LogContext, LoggingServiceInterface } from "../interfaces/logging.interface";

@Injectable()
export class AppLoggingService implements LoggingServiceInterface, LoggerService {
  private logger: pino.Logger;
  private childLoggers: Map<string, pino.Logger> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly clsService: ClsService,
    private readonly tracingService?: TracingService,
  ) {
    this.initializeLogger();
  }

  private initializeLogger(jobName?: string) {
    const loggingConfig = this.configService.get<ConfigLoggingInterface>("logging");

    if (loggingConfig?.loki?.enabled) {
      this.initializeLokiLogger(loggingConfig, jobName);
    } else {
      this.initializeFileLogger(jobName);
    }
  }

  private initializeLokiLogger(loggingConfig: ConfigLoggingInterface, jobName?: string) {
    try {
      const lokiConfig = loggingConfig.loki;

      if (!lokiConfig.host) {
        console.warn(
          "Loki host not configured, falling back to file logging. Set LOKI_HOST to a valid Loki server URL.",
        );
        this.initializeFileLogger(jobName);
        return;
      }

      this.logger = pino(
        {
          level: process.env.LOG_LEVEL || "info",
          ...(jobName && { base: { jobName } }),
        },
        pino.transport({
          targets: [
            {
              target: "pino-loki",
              options: {
                host: lokiConfig.host,
                batching: lokiConfig.batching ?? true,
                interval: lokiConfig.interval ?? 5,
                labels: {
                  application: lokiConfig.labels.application,
                  environment: lokiConfig.labels.environment,
                },
              },
            },
            {
              target: "pino-pretty",
              level: "error",
              options: {
                colorize: true,
                translateTime: false,
                ignore: "pid,hostname",
                messageFormat: "{msg}",
                hideObject: true,
              },
            },
          ],
        }),
      );
    } catch (error) {
      console.warn("Failed to initialize Loki transport, falling back to file logging:", error.message);
      this.initializeFileLogger(jobName);
    }
  }

  private initializeFileLogger(jobName?: string) {
    const streams: pino.StreamEntry[] = [
      {
        level: "error" as pino.Level,
        stream: pretty({
          colorize: true,
          translateTime: false,
          ignore: "pid,hostname",
          messageFormat: "{msg}",
          hideObject: true,
        }),
      },
    ];

    this.logger = pino(
      {
        level: process.env.LOG_LEVEL || "trace",
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label: string) => {
            return { level: label };
          },
        },
        ...(jobName && { base: { jobName } }),
      },
      pino.multistream(streams),
    );
  }

  private getEnrichedContext(context?: string, metadata?: Record<string, any>): any {
    const requestContext = this.getRequestContext();
    const traceContext = this.tracingService?.getCurrentTracingContext();

    return {
      context,
      ...metadata,
      ...requestContext,
      ...(traceContext && {
        traceId: traceContext.traceId,
        spanId: traceContext.spanId,
      }),
    };
  }

  // NestJS LoggerService interface implementation
  log(message: any, context?: string, metadata?: Record<string, any>) {
    if (typeof message === "object") {
      this.logger.info(this.getEnrichedContext(context, metadata), JSON.stringify(message));
    } else {
      this.logger.info(this.getEnrichedContext(context, metadata), message);
    }
  }

  error(message: any, errorOrTrace?: Error | string, context?: string, metadata?: Record<string, any>) {
    let enrichedContext: any;
    let logMessage: string;

    if (errorOrTrace instanceof Error) {
      // New interface signature: error object provided
      enrichedContext = this.getEnrichedContext(context, {
        ...metadata,
        error: errorOrTrace.message,
        errorName: errorOrTrace.name,
      });

      // Include stack in the message for console visibility
      logMessage =
        typeof message === "object"
          ? `${JSON.stringify(message)}\nStack: ${errorOrTrace.stack}`
          : `${message}\nStack: ${errorOrTrace.stack}`;
    } else {
      // Legacy NestJS LoggerService signature: trace string provided
      enrichedContext = this.getEnrichedContext(context, {
        ...metadata,
        trace: errorOrTrace,
      });

      logMessage = typeof message === "object" ? JSON.stringify(message) : message;
    }

    this.logger.error(enrichedContext, logMessage);
  }

  warn(message: any, context?: string, metadata?: Record<string, any>) {
    if (typeof message === "object") {
      this.logger.warn(this.getEnrichedContext(context, metadata), JSON.stringify(message));
    } else {
      this.logger.warn(this.getEnrichedContext(context, metadata), message);
    }
  }

  debug(message: any, context?: string, metadata?: Record<string, any>) {
    if (typeof message === "object") {
      this.logger.debug(this.getEnrichedContext(context, metadata), JSON.stringify(message));
    } else {
      this.logger.debug(this.getEnrichedContext(context, metadata), message);
    }
  }

  verbose(message: any, context?: string, metadata?: Record<string, any>) {
    if (typeof message === "object") {
      this.logger.trace(this.getEnrichedContext(context, metadata), JSON.stringify(message));
    } else {
      this.logger.trace(this.getEnrichedContext(context, metadata), message);
    }
  }

  fatal(message: any, error?: Error, context?: string, metadata?: Record<string, any>) {
    const enrichedContext = this.getEnrichedContext(context, {
      ...metadata,
      ...(error && {
        error: error.message,
        errorName: error.name,
      }),
    });

    let logMessage: string;
    if (error) {
      logMessage =
        typeof message === "object"
          ? `${JSON.stringify(message)}\nStack: ${error.stack}`
          : `${message}\nStack: ${error.stack}`;
    } else {
      logMessage = typeof message === "object" ? JSON.stringify(message) : message;
    }

    this.logger.fatal(enrichedContext, logMessage);
  }

  trace(message: any, context?: string, metadata?: Record<string, any>) {
    if (typeof message === "object") {
      this.logger.trace(this.getEnrichedContext(context, metadata), JSON.stringify(message));
    } else {
      this.logger.trace(this.getEnrichedContext(context, metadata), message);
    }
  }

  // Enhanced LoggingServiceInterface methods
  logWithContext(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logger.info(this.getEnrichedContext(context, metadata), message);
  }

  errorWithContext(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const enrichedContext = this.getEnrichedContext(context, {
      ...metadata,
      ...(error && {
        error: error.message,
        errorName: error.name,
      }),
    });

    const logMessage = error ? `${message}\nStack: ${error.stack}` : message;
    this.logger.error(enrichedContext, logMessage);
  }

  // Context management using ClsService
  setRequestContext(context: LogContext): void {
    this.clsService.set("logContext", context);
  }

  getRequestContext(): LogContext | undefined {
    return this.clsService.get("logContext");
  }

  clearRequestContext(): void {
    this.clsService.set("logContext", undefined);
  }

  // Child logger creation
  createChildLogger(context: string, metadata?: Record<string, any>): LoggingServiceInterface {
    const childKey = `${context}_${JSON.stringify(metadata || {})}`;

    if (!this.childLoggers.has(childKey)) {
      const childLogger = this.logger.child({
        context,
        ...metadata,
      });
      this.childLoggers.set(childKey, childLogger);
    }

    return new ChildLoggingService(
      this.childLoggers.get(childKey)!,
      this.clsService,
      this.tracingService,
      context,
      metadata,
    );
  }

  // Utility methods for structured logging
  logHttpRequest(method: string, url: string, statusCode: number, responseTime: number, ip?: string): void {
    this.logWithContext(`${method} ${url} - ${statusCode} (${responseTime}ms)`, "HTTP", {
      httpMethod: method,
      httpUrl: url,
      httpStatusCode: statusCode,
      responseTimeMs: responseTime,
      clientIp: ip,
    });
  }

  logHttpError(method: string, url: string, error: Error, responseTime: number, ip?: string): void {
    this.errorWithContext(`${method} ${url} - ERROR (${responseTime}ms): ${error.message}`, error, "HTTP", {
      httpMethod: method,
      httpUrl: url,
      responseTimeMs: responseTime,
      clientIp: ip,
    });
  }

  logBusinessEvent(event: string, data?: Record<string, any>): void {
    this.logWithContext(`Business Event: ${event}`, "BUSINESS", data);
  }

  logSecurityEvent(event: string, data?: Record<string, any>): void {
    this.logWithContext(`Security Event: ${event}`, "SECURITY", {
      ...data,
      securityEvent: true,
    });
  }
}

// Child logger implementation for scoped logging
class ChildLoggingService implements LoggingServiceInterface {
  constructor(
    private readonly childLogger: pino.Logger,
    private readonly clsService: ClsService,
    private readonly tracingService?: TracingService,
    private readonly childContext?: string,
    private readonly childMetadata?: Record<string, any>,
  ) {}

  private getEnrichedContext(context?: string, metadata?: Record<string, any>): any {
    const requestContext = this.clsService.get("logContext");
    const traceContext = this.tracingService?.getCurrentTracingContext();

    return {
      context: context || this.childContext,
      ...this.childMetadata,
      ...metadata,
      ...requestContext,
      ...(traceContext && {
        traceId: traceContext.traceId,
        spanId: traceContext.spanId,
      }),
    };
  }

  log(message: any, context?: string, metadata?: Record<string, any>): void {
    this.childLogger.info(this.getEnrichedContext(context, metadata), message);
  }

  error(message: any, error?: Error | string, context?: string, metadata?: Record<string, any>): void {
    let enrichedContext: any;
    let logMessage: string;

    if (error instanceof Error) {
      enrichedContext = this.getEnrichedContext(context, {
        ...metadata,
        error: error.message,
        errorName: error.name,
      });

      logMessage =
        typeof message === "object"
          ? `${JSON.stringify(message)}\nStack: ${error.stack}`
          : `${message}\nStack: ${error.stack}`;
    } else {
      enrichedContext = this.getEnrichedContext(context, {
        ...metadata,
        trace: error,
      });

      logMessage = typeof message === "object" ? JSON.stringify(message) : message;
    }

    this.childLogger.error(enrichedContext, logMessage);
  }

  warn(message: any, context?: string, metadata?: Record<string, any>): void {
    this.childLogger.warn(this.getEnrichedContext(context, metadata), message);
  }

  debug(message: any, context?: string, metadata?: Record<string, any>): void {
    this.childLogger.debug(this.getEnrichedContext(context, metadata), message);
  }

  verbose(message: any, context?: string, metadata?: Record<string, any>): void {
    this.childLogger.trace(this.getEnrichedContext(context, metadata), message);
  }

  fatal(message: any, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const enrichedContext = this.getEnrichedContext(context, {
      ...metadata,
      ...(error && {
        error: error.message,
        errorName: error.name,
      }),
    });

    let logMessage: string;
    if (error) {
      logMessage =
        typeof message === "object"
          ? `${JSON.stringify(message)}\nStack: ${error.stack}`
          : `${message}\nStack: ${error.stack}`;
    } else {
      logMessage = typeof message === "object" ? JSON.stringify(message) : message;
    }

    this.childLogger.fatal(enrichedContext, logMessage);
  }

  trace(message: any, context?: string, metadata?: Record<string, any>): void {
    this.childLogger.trace(this.getEnrichedContext(context, metadata), message);
  }

  logWithContext(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(message, context, metadata);
  }

  errorWithContext(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    this.error(message, error, context, metadata);
  }

  setRequestContext(context: LogContext): void {
    this.clsService.set("logContext", context);
  }

  getRequestContext(): LogContext | undefined {
    return this.clsService.get("logContext");
  }

  clearRequestContext(): void {
    this.clsService.set("logContext", undefined);
  }

  createChildLogger(context: string, metadata?: Record<string, any>): LoggingServiceInterface {
    const newMetadata = { ...this.childMetadata, ...metadata };
    const newContext = `${this.childContext}.${context}`;

    return new ChildLoggingService(
      this.childLogger.child({ context: newContext, ...newMetadata }),
      this.clsService,
      this.tracingService,
      newContext,
      newMetadata,
    );
  }
}
