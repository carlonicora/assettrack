import { Entity } from "src/common/abstracts/entity";
import { Feature } from "src/foundations/feature/entities/feature.entity";

export type Role = Entity & {
  name: string;
  description?: string;

  isSelectable?: boolean;

  requiredFeature?: Feature;
};
