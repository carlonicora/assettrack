import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export interface ModuleInterface extends ApiDataInterface {
  get name(): string;
  get isCore(): boolean;
  get permissions(): {
    create: boolean | string;
    read: boolean | string;
    update: boolean | string;
    delete: boolean | string;
  };
}
