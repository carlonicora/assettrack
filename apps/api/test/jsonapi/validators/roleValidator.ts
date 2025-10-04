import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { roleMeta } from "src/foundations/role/entities/role.meta";
import { ResourceValidator } from "../JsonApiValidator";
import { standardMeta } from "./common";

export const roleValidator: ResourceValidator = {
  type: roleMeta.type,
  attributes: {
    name: { required: true },
    isSelectable: { required: true, type: "boolean" },
  },
  meta: { ...standardMeta },
  relationships: {
    requiredFeature: {
      type: featureMeta.type,
    },
  },
};
