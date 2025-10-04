import { BullModule } from "@nestjs/bullmq";
import { Module, OnModuleInit } from "@nestjs/common";
import { createWorkerProvider } from "src/common/decorators/conditional-service.decorator";
import { modelRegistry } from "src/common/registries/registry";

import { CompanyController } from "src/foundations/company/controllers/company.controller";
import { CompanyModel } from "src/foundations/company/entities/company.model";
import { CompanyProcessor } from "src/foundations/company/processors/company.processor";
import { CompanyRepository } from "src/foundations/company/repositories/company.repository";
import { CompanySerialiser } from "src/foundations/company/serialisers/company.serialiser";
import { CompanyService } from "src/foundations/company/services/company.service";
import { FeatureModule } from "src/foundations/feature/feature.module";
import { S3Module } from "src/foundations/s3/s3.module";

@Module({
  controllers: [CompanyController],
  providers: [CompanyRepository, CompanyService, CompanySerialiser, createWorkerProvider(CompanyProcessor)],
  exports: [CompanyService, CompanySerialiser, CompanyRepository],
  imports: [BullModule.registerQueue({ name: `${process.env.QUEUE}_company` }), FeatureModule, S3Module],
})
export class CompanyModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(CompanyModel);
  }
}
