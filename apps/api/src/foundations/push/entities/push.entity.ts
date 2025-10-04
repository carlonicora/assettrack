import { Entity } from "src/common/abstracts/entity";
import { PushSubscriptionDTO } from "src/foundations/push/dtos/subscription.push.dto";

export type Push = Entity & {
  endpoint: string;
  p256dh: string;
  auth: string;
  subscription: PushSubscriptionDTO;
};
