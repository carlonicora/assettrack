import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CorsService } from "src/core/cors/services/cors.service";

@Module({
  imports: [ConfigModule],
  providers: [CorsService],
  exports: [CorsService],
})
export class CorsModule {}
