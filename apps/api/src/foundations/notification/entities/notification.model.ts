import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Notification } from "src/foundations/notification/entities/notification.entity";
import { mapNotification } from "src/foundations/notification/entities/notification.map";
import { notificationMeta } from "src/foundations/notification/entities/notification.meta";
import { NotificationSerialiser } from "src/foundations/notification/serialisers/notifications.serialiser";
import { userMeta } from "src/foundations/user/entities/user.meta";

export const NotificationModel: DataModelInterface<Notification> = {
  ...notificationMeta,
  entity: undefined as unknown as Notification,
  mapper: mapNotification,
  serialiser: NotificationSerialiser,
  singleChildrenTokens: [userMeta.nodeName],
};
