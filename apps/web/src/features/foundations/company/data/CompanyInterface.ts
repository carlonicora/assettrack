import { FeatureInterface } from "@/features/foundations/feature/data/FeatureInterface";
import { ModuleInterface } from "@/features/foundations/module/data/ModuleInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type CompanyInput = {
  id: string;
  name?: string;
  logo?: string;

  license?: string;
  privateKey?: string;

  featureIds?: string[];
  moduleIds?: string[];
};

export interface CompanyInterface extends ApiDataInterface {
  get name(): string;
  get logo(): string | undefined;
  get logoUrl(): string | undefined;

  get licenseExpirationDate(): Date | undefined;

  get features(): FeatureInterface[];
  get modules(): ModuleInterface[];
}
