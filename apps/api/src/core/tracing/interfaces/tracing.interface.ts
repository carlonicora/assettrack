export interface TracingContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export interface SpanOptions {
  attributes?: Record<string, string | number | boolean>;
  events?: Array<{
    name: string;
    attributes?: Record<string, string | number | boolean>;
    timestamp?: number;
  }>;
}

// export interface TracingService {
//   startSpan(name: string, options?: SpanOptions): any;
//   addSpanAttribute(key: string, value: string | number | boolean): void;
//   addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void;
//   getCurrentTraceId(): string | undefined;
//   getCurrentSpanId(): string | undefined;
//   createChildSpan(name: string, options?: SpanOptions): any;
//   endSpan(span?: any): void;
//   getActiveSpan(): any;
// }
