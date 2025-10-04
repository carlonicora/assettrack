import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type NotificationInput = {
  id: string;
  isRead: boolean;
};

export interface NotificationInterface extends ApiDataInterface {
  get notificationType(): string;
  get isRead(): boolean;

  get actor(): UserInterface | undefined;
}
