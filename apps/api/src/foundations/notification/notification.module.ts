import { Module, OnModuleInit } from "@nestjs/common";
import { modelRegistry } from "src/common/registries/registry";
import { NotificationController } from "src/foundations/notification/controllers/notification.controller";
import { NotificationModel } from "src/foundations/notification/entities/notification.model";
import { NotificationRepository } from "src/foundations/notification/repositories/notification.repository";
import { NotificationSerialiser } from "src/foundations/notification/serialisers/notifications.serialiser";
import { NotificationServices } from "src/foundations/notification/services/notification.service";

@Module({
  controllers: [NotificationController],
  providers: [NotificationRepository, NotificationServices, NotificationSerialiser],
  exports: [NotificationRepository],
  imports: [],
})
export class NotificationModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(NotificationModel);
  }
}
