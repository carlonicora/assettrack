import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigRedisInterface } from "src/common/config/interfaces/config.redis.interface";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisConfig = config.get<ConfigRedisInterface>("redis");
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            username: redisConfig.username,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
