import { Global, Module } from "@nestjs/common";
import { APP_MODE_TOKEN, AppModeConfig } from "./constants/app.mode.constant";

@Global()
@Module({})
export class AppModeModule {
  static forRoot(modeConfig: AppModeConfig) {
    return {
      module: AppModeModule,
      providers: [
        {
          provide: APP_MODE_TOKEN,
          useValue: modeConfig,
        },
      ],
      exports: [APP_MODE_TOKEN],
    };
  }
}
