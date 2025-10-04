import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Server, Socket } from "socket.io";
import { APP_MODE_TOKEN, AppModeConfig } from "../../appmode/constants/app.mode.constant";
import { RedisClientStorageService } from "../../redis/services/redis.client.storage.service";
import { NotificationMessage, RedisMessagingService } from "../../redis/services/redis.messaging.service";

@Injectable()
export class WebSocketService implements OnModuleInit {
  private server: Server;
  private clients: Map<string, Socket[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private redisClientStorage: RedisClientStorageService,
    private redisMessaging: RedisMessagingService,
    @Inject(APP_MODE_TOKEN) private appModeConfig: AppModeConfig,
  ) {}

  onModuleInit() {
    setInterval(
      () => {
        this.redisClientStorage.cleanupExpiredClients();
      },
      5 * 60 * 1000,
    );
  }

  setServer(server: Server) {
    this.server = server;
  }

  async addClient(userId: string, client: Socket) {
    const existingClients = this.clients.get(userId) || [];
    existingClients.push(client);
    this.clients.set(userId, existingClients);

    await this.redisClientStorage.addClient(userId, client.data.user.companyId, client.id);
  }

  async removeClient(userId: string, client: Socket) {
    const existingClients = this.clients.get(userId);
    if (existingClients) {
      const index = existingClients.indexOf(client);
      if (index !== -1) {
        existingClients.splice(index, 1);
        if (existingClients.length > 0) {
          this.clients.set(userId, existingClients);
        } else {
          this.clients.delete(userId);
        }
      }
    }

    await this.redisClientStorage.removeClient(client.id);
  }

  async broadcast(event: string, data: any) {
    if (this.appModeConfig.mode === "worker") {
      await this.redisMessaging.publishBroadcastNotification(event, data);
      return;
    }

    this.broadcastDirect(event, data);
  }

  private broadcastDirect(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }

  async sendMessageToCompany(companyId: string, event: string, data: any) {
    if (this.appModeConfig.mode === "worker") {
      await this.redisMessaging.publishCompanyNotification(companyId, event, data);
      return;
    }

    this.sendMessageToCompanyDirect(companyId, event, data);
  }

  private async sendMessageToCompanyDirect(companyId: string, event: string, data: any) {
    const companyUsers = await this.redisClientStorage.getCompanyUsers(companyId);

    companyUsers.forEach((userId) => {
      const clients = this.clients.get(userId);
      if (clients && clients.length > 0) {
        clients.forEach((client) => client.emit(event, data));
      }
    });
  }

  async sendMessageToUser(userId: string, event: string, data: any) {
    if (this.appModeConfig.mode === "worker") {
      await this.redisMessaging.publishUserNotification(userId, event, data);
      return;
    }

    this.sendMessageToUserDirect(userId, event, data);
  }

  private sendMessageToUserDirect(userId: string, event: string, data: any) {
    const clients = this.clients.get(userId);
    if (clients && clients.length > 0) {
      clients.forEach((client) => client.emit(event, data));
    }
  }

  handleIncomingMessage(companyId: string, userId: string, message: { type: string; message: any }) {
    this.eventEmitter.emit(message.type, { companyId, userId, message });
  }

  handleIncomingGoogleMeetPart(meetId: string, speakerName: string, timestamp: Date, message: any) {
    this.eventEmitter.emit("googlemeet", { meetId, speakerName, timestamp, message });
  }

  @OnEvent("redis.notification")
  async handleRedisNotification(notification: NotificationMessage) {
    switch (notification.type) {
      case "user":
        if (notification.targetId) {
          this.sendMessageToUserDirect(notification.targetId, notification.event, notification.data);
        }
        break;
      case "company":
        if (notification.targetId) {
          await this.sendMessageToCompanyDirect(notification.targetId, notification.event, notification.data);
        }
        break;
      case "broadcast":
        this.broadcastDirect(notification.event, notification.data);
        break;
    }
  }
}
