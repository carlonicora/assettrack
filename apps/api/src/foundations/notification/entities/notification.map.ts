import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Notification } from "src/foundations/notification/entities/notification.entity";

export const mapNotification = (params: { data: any; record: any; entityFactory: EntityFactory }): Notification => {
  return {
    ...mapEntity({ record: params.data }),
    notificationType: params.data.notificationType,
    isRead: params.data.isRead,
    actor: undefined,
  };
};
