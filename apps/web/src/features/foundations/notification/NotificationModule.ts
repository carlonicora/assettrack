import { Notification } from "@/features/foundations/notification/data/Notification";
import { FactoryType } from "@/permisions/types";

export const NotificationModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/notifications",
    name: "notifications",
    model: Notification,
    moduleId: "9259d704-c670-4e77-a3a1-a728ffc5be3d",
  });
