import { Entity } from "src/common/abstracts/entity";
import { User } from "src/foundations/user/entities/user.entity";

export type Notification = Entity & {
  notificationType: string;
  isRead: boolean;

  actor?: User;
};
