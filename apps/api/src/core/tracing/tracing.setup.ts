import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { baseConfig } from "src/common/config/base.config";

export class TracingSetup {
  private static instance: TracingSetup;
  private sdk: any;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): TracingSetup {
    if (!TracingSetup.instance) {
      TracingSetup.instance = new TracingSetup();
    }
    return TracingSetup.instance;
  }

  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    const config = baseConfig.tempo;

    if (!config.enabled) {
      return;
    }

    try {
      const traceExporter = new OTLPTraceExporter({
        url: config.endpoint,
      });

      const sdk = new NodeSDK({
        resource: resourceFromAttributes({
          [ATTR_SERVICE_NAME]: config.serviceName,
          [ATTR_SERVICE_VERSION]: config.serviceVersion,
        }),
        traceExporter,
        instrumentations: [
          new HttpInstrumentation({
            requestHook: (span: any, request: any) => {
              // Add custom attributes to HTTP spans
              if (request && request.headers) {
                span.setAttributes({
                  "http.user_agent": request.headers["user-agent"] || "",
                  "http.forwarded_for": request.headers["x-forwarded-for"] || "",
                });
              }
            },
          }),
          new NestInstrumentation(),
        ],
      });

      sdk.start();
      this.sdk = sdk;
      this.isInitialized = true;

      // Handle graceful shutdown
      process.on("SIGTERM", () => {
        this.shutdown();
      });

      process.on("SIGINT", () => {
        this.shutdown();
      });
    } catch (error) {
      console.error("Failed to initialize tracing:", error);
      throw error;
    }
  }

  public shutdown(): void {
    if (this.sdk && this.isInitialized) {
      this.sdk
        .shutdown()
        .then(() => {
          this.isInitialized = false;
        })
        .catch((error: any) => {
          console.error("Error shutting down tracing:", error);
        });
    }
  }

  public isTracingEnabled(): boolean {
    return baseConfig.tempo.enabled;
  }
}

// Export singleton instance
export const tracingSetup = TracingSetup.getInstance();
