import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";
import { AppLoggingService } from "./services/logging.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AppLoggingService, LoggingInterceptor],
  exports: [AppLoggingService, LoggingInterceptor],
})
export class LoggingModule {}
