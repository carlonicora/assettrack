import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TracingInterceptor } from "./interceptors/tracing.interceptor";
import { TracingService } from "./services/tracing.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TracingService, TracingInterceptor],
  exports: [TracingService, TracingInterceptor],
})
export class TracingModule {}
