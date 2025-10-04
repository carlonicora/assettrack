import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { S3Controller } from "src/foundations/s3/controllers/s3.controller";
import { S3Model } from "src/foundations/s3/entities/s3.model";
import { S3Serialiser } from "src/foundations/s3/serialisers/s3.serialiser";
import { S3Service } from "src/foundations/s3/services/s3.service";

@Module({
  controllers: [S3Controller],
  providers: [S3Service, S3Serialiser],
  exports: [S3Service, S3Serialiser],
})
export class S3Module implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(S3Model);
  }
}
