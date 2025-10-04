import { FeatureInterface } from "@/features/foundations/feature/data/FeatureInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type RoleInput = {
  id: string;
  name: string;
  description?: string;
};

export interface RoleInterface extends ApiDataInterface {
  get name(): string;
  get description(): string;
  get isSelectable(): boolean;

  get requiredFeature(): FeatureInterface | undefined;
}
