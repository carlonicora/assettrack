import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Redis } from "ioredis";
import { BaseConfigInterface } from "src/common/config/interfaces/base.config.interface";
import { ConfigEnvironmentInterface } from "src/common/config/interfaces/config.environment.interface";
import { ConfigRedisInterface } from "src/common/config/interfaces/config.redis.interface";

export interface NotificationMessage {
  type: "user" | "company" | "broadcast";
  targetId?: string; // userId for 'user', companyId for 'company', undefined for 'broadcast'
  event: string;
  data: any;
  timestamp: Date;
  source: "worker" | "api";
}

@Injectable()
export class RedisMessagingService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;
  private readonly CHANNEL = "websocket_notifications";

  constructor(
    private eventEmitter: EventEmitter2,
    private readonly config: ConfigService<BaseConfigInterface>,
  ) {}

  onModuleInit() {
    this.publisher = new Redis({
      host: this.config.get<ConfigRedisInterface>("redis").host,
      port: this.config.get<ConfigRedisInterface>("redis").port,
      username: this.config.get<ConfigRedisInterface>("redis").username,
      password: this.config.get<ConfigRedisInterface>("redis").password,
    });

    this.subscriber = new Redis({
      host: this.config.get<ConfigRedisInterface>("redis").host,
      port: this.config.get<ConfigRedisInterface>("redis").port,
      username: this.config.get<ConfigRedisInterface>("redis").username,
      password: this.config.get<ConfigRedisInterface>("redis").password,
    });

    // Subscribe to notifications channel
    this.subscriber.subscribe(this.CHANNEL);

    // Handle incoming messages
    this.subscriber.on("message", (channel: string, message: string) => {
      if (channel === this.CHANNEL) {
        try {
          const notification: NotificationMessage = JSON.parse(message);
          // Emit local event for WebSocketService to handle
          this.eventEmitter.emit("redis.notification", notification);
        } catch (error) {
          console.error("Error parsing Redis notification message:", error);
        }
      }
    });
  }

  async publishNotification(notification: Omit<NotificationMessage, "timestamp" | "source">): Promise<void> {
    const fullNotification: NotificationMessage = {
      ...notification,
      timestamp: new Date(),
      source: this.config.get<ConfigEnvironmentInterface>("environment").type,
    };

    await this.publisher.publish(this.CHANNEL, JSON.stringify(fullNotification));
  }

  async publishUserNotification(userId: string, event: string, data: any): Promise<void> {
    await this.publishNotification({
      type: "user",
      targetId: userId,
      event,
      data,
    });
  }

  async publishCompanyNotification(companyId: string, event: string, data: any): Promise<void> {
    await this.publishNotification({
      type: "company",
      targetId: companyId,
      event,
      data,
    });
  }

  async publishBroadcastNotification(event: string, data: any): Promise<void> {
    await this.publishNotification({
      type: "broadcast",
      event,
      data,
    });
  }

  async onModuleDestroy() {
    try {
      if (this.publisher) {
        await this.publisher.quit();
      }
    } catch (error) {
      console.error("Error disconnecting Redis publisher:", error);
      this.publisher?.disconnect();
    }

    try {
      if (this.subscriber) {
        await this.subscriber.quit();
      }
    } catch (error) {
      console.error("Error disconnecting Redis subscriber:", error);
      this.subscriber?.disconnect();
    }
  }
}
