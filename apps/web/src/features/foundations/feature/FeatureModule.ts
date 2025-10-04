import { Feature } from "@/features/foundations/feature/data/Feature";
import { FactoryType } from "@/permisions/types";

export const FeatureModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/features",
    name: "features",
    model: Feature,
    moduleId: "025fdd23-2803-4360-9fd9-eaa3612c2e23",
  });
