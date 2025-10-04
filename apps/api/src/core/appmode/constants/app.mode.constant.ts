export const APP_MODE_TOKEN = Symbol("APP_MODE");

export enum AppMode {
  API = "api",
  WORKER = "worker",
}

export interface AppModeConfig {
  mode: AppMode;
  enableControllers: boolean;
  enableWorkers: boolean;
  enableCronJobs: boolean;
}
