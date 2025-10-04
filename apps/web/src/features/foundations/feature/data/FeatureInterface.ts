import { ModuleInterface } from "@/features/foundations/module/data/ModuleInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export interface FeatureInterface extends ApiDataInterface {
  get name(): string;
  get isProduction(): boolean;

  get modules(): ModuleInterface[];
}
