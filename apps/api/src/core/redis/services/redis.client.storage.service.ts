import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { BaseConfigInterface } from "src/common/config/interfaces/base.config.interface";
import { ConfigRedisInterface } from "src/common/config/interfaces/config.redis.interface";

interface ClientInfo {
  userId: string;
  companyId: string;
  socketId: string;
  connectedAt: Date;
}

@Injectable()
export class RedisClientStorageService implements OnModuleDestroy {
  private redis: Redis;
  private readonly CLIENT_KEY_PREFIX = "ws_client:";
  private readonly USER_CLIENTS_KEY_PREFIX = "user_clients:";
  private readonly COMPANY_USERS_KEY_PREFIX = "company_users:";

  constructor(private readonly config: ConfigService<BaseConfigInterface>) {
    this.redis = new Redis({
      host: this.config.get<ConfigRedisInterface>("redis").host,
      port: this.config.get<ConfigRedisInterface>("redis").port,
      username: this.config.get<ConfigRedisInterface>("redis").username,
      password: this.config.get<ConfigRedisInterface>("redis").password,
    });
  }

  // Getter to access Redis client for other services
  public getRedisClient(): Redis {
    return this.redis;
  }

  async addClient(userId: string, companyId: string, socketId: string): Promise<void> {
    const clientInfo: ClientInfo = {
      userId,
      companyId,
      socketId,
      connectedAt: new Date(),
    };

    const pipeline = this.redis.pipeline();

    // Store client info
    pipeline.hset(
      `${this.CLIENT_KEY_PREFIX}${socketId}`,
      "userId",
      userId,
      "companyId",
      companyId,
      "connectedAt",
      clientInfo.connectedAt.toISOString(),
    );

    // Add socket to user's client list
    pipeline.sadd(`${this.USER_CLIENTS_KEY_PREFIX}${userId}`, socketId);

    // Add user to company's user list
    pipeline.sadd(`${this.COMPANY_USERS_KEY_PREFIX}${companyId}`, userId);

    // Set expiration for client info (24 hours)
    pipeline.expire(`${this.CLIENT_KEY_PREFIX}${socketId}`, 24 * 60 * 60);

    await pipeline.exec();
  }

  async removeClient(socketId: string): Promise<void> {
    try {
      const clientInfo = await this.getClientInfo(socketId);
      if (!clientInfo) return;

      const pipeline = this.redis.pipeline();

      // Remove client info
      pipeline.del(`${this.CLIENT_KEY_PREFIX}${socketId}`);

      // Remove socket from user's client list
      pipeline.srem(`${this.USER_CLIENTS_KEY_PREFIX}${clientInfo.userId}`, socketId);

      // Check if user has any other clients, if not remove from company
      const userClients = await this.getUserClients(clientInfo.userId);
      if (userClients.length <= 1) {
        // <= 1 because we're removing this one
        pipeline.srem(`${this.COMPANY_USERS_KEY_PREFIX}${clientInfo.companyId}`, clientInfo.userId);
      }

      await pipeline.exec();
    } catch (error) {
      // Redis connection might be closed during shutdown
      console.warn(`Redis connection error removing client ${socketId}:`, error.message);
    }
  }

  async getClientInfo(socketId: string): Promise<ClientInfo | null> {
    try {
      const clientData = await this.redis.hgetall(`${this.CLIENT_KEY_PREFIX}${socketId}`);

      if (!clientData.userId) return null;

      return {
        userId: clientData.userId,
        companyId: clientData.companyId,
        socketId,
        connectedAt: new Date(clientData.connectedAt),
      };
    } catch (error) {
      // Redis connection might be closed during shutdown
      console.warn(`Redis connection error getting client info for ${socketId}:`, error.message);
      return null;
    }
  }

  async getUserClients(userId: string): Promise<string[]> {
    try {
      return await this.redis.smembers(`${this.USER_CLIENTS_KEY_PREFIX}${userId}`);
    } catch (error) {
      console.warn(`Redis connection error getting user clients for ${userId}:`, error.message);
      return [];
    }
  }

  async getCompanyUsers(companyId: string): Promise<string[]> {
    return await this.redis.smembers(`${this.COMPANY_USERS_KEY_PREFIX}${companyId}`);
  }

  async getUserCompany(userId: string): Promise<string | null> {
    const clients = await this.getUserClients(userId);
    if (clients.length === 0) return null;

    const clientInfo = await this.getClientInfo(clients[0]);
    return clientInfo?.companyId || null;
  }

  async getAllConnectedUsers(): Promise<string[]> {
    const keys = await this.redis.keys(`${this.USER_CLIENTS_KEY_PREFIX}*`);
    return keys.map((key) => key.replace(this.USER_CLIENTS_KEY_PREFIX, ""));
  }

  async cleanupExpiredClients(): Promise<void> {
    // This method can be called periodically to clean up orphaned data
    const userKeys = await this.redis.keys(`${this.USER_CLIENTS_KEY_PREFIX}*`);

    for (const userKey of userKeys) {
      const userId = userKey.replace(this.USER_CLIENTS_KEY_PREFIX, "");
      const socketIds = await this.redis.smembers(userKey);

      for (const socketId of socketIds) {
        const exists = await this.redis.exists(`${this.CLIENT_KEY_PREFIX}${socketId}`);
        if (!exists) {
          // Remove orphaned socket reference
          await this.redis.srem(userKey, socketId);
        }
      }

      // If user has no clients, remove from all companies
      const remainingClients = await this.redis.smembers(userKey);
      if (remainingClients.length === 0) {
        const companyKeys = await this.redis.keys(`${this.COMPANY_USERS_KEY_PREFIX}*`);
        const pipeline = this.redis.pipeline();
        for (const companyKey of companyKeys) {
          pipeline.srem(companyKey, userId);
        }
        pipeline.del(userKey);
        await pipeline.exec();
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
    } catch (error) {
      console.error("Error disconnecting Redis client:", error);
      // Fallback to disconnect if quit fails
      this.redis?.disconnect();
    }
  }
}
