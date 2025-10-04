import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheInterceptor } from "src/core/cache/interceptors/cache.interceptor";
import { CacheService } from "src/core/cache/services/cache.service";

@Module({
  imports: [ConfigModule],
  providers: [CacheService, CacheInterceptor],
  exports: [CacheService, CacheInterceptor],
})
export class CacheModule {}
