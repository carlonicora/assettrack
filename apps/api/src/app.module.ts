import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { ClsModule } from "nestjs-cls";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";
import { BaseConfigInterface } from "src/common/config/interfaces/base.config.interface";
import { ConfigRateLimitInterface } from "src/common/config/interfaces/config.ratelimit.interface";
import config from "src/config/config";
import { AppModeModule } from "src/core/appmode/app.mode.module";
import { AppModeConfig } from "src/core/appmode/constants/app.mode.constant";
import { CoreModules } from "src/core/core.modules";
import { FeaturesModules } from "src/features/features.modules";
import { FoundationsModules } from "src/foundations/foundations.modules";

@Module({})
export class AppModule {
  static forRoot(modeConfig: AppModeConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        EventEmitterModule.forRoot(),
        AppModeModule.forRoot(modeConfig),
        ConfigModule.forRoot({
          load: [config],
          isGlobal: true,
          cache: true,
        }),
        ConfigModule,
        ThrottlerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService<BaseConfigInterface>) => {
            const rateLimitConfig = config.get<ConfigRateLimitInterface>("rateLimit");
            return {
              throttlers: [
                {
                  name: "default",
                  ttl: rateLimitConfig.ttl,
                  limit: rateLimitConfig.limit,
                },
                {
                  name: "ip",
                  ttl: rateLimitConfig.ttl,
                  limit: rateLimitConfig.ipLimit,
                },
              ],
            };
          },
        }),
        ClsModule.forRoot({
          global: true,
          middleware: { mount: modeConfig.enableControllers },
        }),
        I18nModule.forRoot({
          fallbackLanguage: "it",
          loaderOptions: {
            path: path.join(__dirname, "i18n"),
            watch: true,
          },
          resolvers: [
            { use: QueryResolver, options: ["lang", "locale", "l"] },
            new HeaderResolver(["x-language"]),
            AcceptLanguageResolver,
          ],
        }),
        ...(modeConfig.enableCronJobs ? [ScheduleModule.forRoot()] : []),
        CoreModules,
        FoundationsModules,
        FeaturesModules,
      ],
      global: true,
      controllers: [],
    };
  }
}
