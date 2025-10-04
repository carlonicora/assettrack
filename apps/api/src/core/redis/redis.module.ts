import { Module } from "@nestjs/common";
import { RedisClientStorageService } from "src/core/redis/services/redis.client.storage.service";
import { RedisMessagingService } from "src/core/redis/services/redis.messaging.service";

@Module({
  providers: [RedisClientStorageService, RedisMessagingService],
  exports: [RedisClientStorageService, RedisMessagingService],
})
export class RedisModule {}
