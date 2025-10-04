import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigVapidInterface } from "src/common/config/interfaces/config.vapid.interface";
import { ConfigInterface } from "src/config/interfaces/config.interface";
import { PushSubscriptionDTO } from "src/foundations/push/dtos/subscription.push.dto";
import { Push } from "src/foundations/push/entities/push.entity";
import { PushRepository } from "src/foundations/push/repositories/push.repository";
import * as webPush from "web-push";

@Injectable()
export class PushService {
  private _isActive = true;

  constructor(
    private readonly pushRepository: PushRepository,
    private readonly config: ConfigService<ConfigInterface>,
  ) {
    if (
      !this.config.get<ConfigVapidInterface>("vapid").publicKey ||
      !this.config.get<ConfigVapidInterface>("vapid").privateKey
    ) {
      this._isActive = false;
      return;
    }

    webPush.setVapidDetails(
      `mailto:${this.config.get<ConfigVapidInterface>("vapid").email}`,
      this.config.get<ConfigVapidInterface>("vapid").publicKey,
      this.config.get<ConfigVapidInterface>("vapid").privateKey,
    );
  }

  async registerSubscription(params: { subscription: PushSubscriptionDTO }): Promise<void> {
    if (!this._isActive) return;

    const existingPush = await this.pushRepository.findByEndpoint({ endpoint: params.subscription.endpoint });

    if (!existingPush || !existingPush.length)
      await this.pushRepository.create({
        endpoint: params.subscription.endpoint,
        p256dh: params.subscription.keys.p256dh,
        auth: params.subscription.keys.auth,
      });
  }

  async sendNotification(params: {
    pushSubscriptions: Push[];
    title: string;
    message: string;
    url: string;
  }): Promise<void> {
    if (!this._isActive) return;

    const payload = {
      title: params.title,
      message: params.message,
      url: params.url,
    };

    await Promise.all(
      params.pushSubscriptions.map(async (pushSubscription) => {
        try {
          await webPush.sendNotification(pushSubscription.subscription, JSON.stringify(payload));
        } catch (error) {
          console.error("Error sending push notification", error);
        }
      }),
    );
  }
}
