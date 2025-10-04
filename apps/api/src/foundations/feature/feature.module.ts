import { Module, OnModuleInit } from "@nestjs/common";

import { modelRegistry } from "src/common/registries/registry";
import { FeatureController } from "src/foundations/feature/controllers/feature.controller";
import { FeatureModel } from "src/foundations/feature/entities/feature.model";
import { FeatureSerialiser } from "src/foundations/feature/serialisers/feature.serialiser";
import { FeatureRepository } from "./repositories/feature.repository";
import { FeatureService } from "./services/feature.service";

@Module({
  controllers: [FeatureController],
  providers: [FeatureRepository, FeatureService, FeatureSerialiser],
  exports: [FeatureService, FeatureRepository, FeatureSerialiser],
})
export class FeatureModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(FeatureModel);
  }
}
