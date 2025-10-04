import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { ModuleModel } from "src/foundations/module/entities/module.model";
import { ModuleRepository } from "src/foundations/module/repositories/module.repository";

import { ModuleSerialiser } from "src/foundations/module/serialisers/module.serialiser";

@Module({
  controllers: [],
  providers: [ModuleSerialiser, ModuleRepository],
  exports: [ModuleSerialiser, ModuleRepository],
  imports: [],
})
export class ModuleModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(ModuleModel);
  }
}
