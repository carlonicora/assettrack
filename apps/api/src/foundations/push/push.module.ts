import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { PushController } from "src/foundations/push/controllers/push.controller";
import { PushModel } from "src/foundations/push/entities/push.model";
import { PushRepository } from "src/foundations/push/repositories/push.repository";
import { PushService } from "src/foundations/push/services/push.service";

@Module({
  controllers: [PushController],
  providers: [PushService, PushRepository],
  exports: [PushRepository, PushService],
  imports: [],
})
export class PushModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(PushModel);
  }
}
