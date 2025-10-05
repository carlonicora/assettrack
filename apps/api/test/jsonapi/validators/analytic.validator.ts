import { analyticMeta } from "src/features/analytic/entities/analytic.meta";
import { ResourceValidator } from "test/jsonapi/JsonApiValidator";
import { standardMeta } from "test/jsonapi/validators/common";

export const analyticValidator: ResourceValidator = {
  type: analyticMeta.type,
  attributes: {
    equipment: {
      required: true,
      type: "number",
    },
    loan: {
      required: true,
      type: "number",
    },
    expiring30: {
      required: true,
      type: "number",
    },
    expiring60: {
      required: true,
      type: "number",
    },
    expiring90: {
      required: true,
      type: "number",
    },
    expired: {
      required: true,
      type: "number",
    },
  },
  meta: {
    ...standardMeta,
  },
  relationships: {},
};
