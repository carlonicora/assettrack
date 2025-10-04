import { companyMeta } from "src/foundations/company/entities/company.meta";
import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { moduleMeta } from "src/foundations/module/entities/module.meta";
import { standardMeta } from "test/jsonapi/validators/common";
import { ResourceValidator } from "../JsonApiValidator";

export const companyValidator: ResourceValidator = {
  type: companyMeta.type,
  attributes: {
    name: {
      required: true,
    },
    logo: {},
    logoUrl: {},
  },
  meta: {
    ...standardMeta,
  },
  relationships: {
    features: {
      type: featureMeta.type,
      isArray: true,
    },
    modules: {
      type: moduleMeta.type,
      isArray: true,
    },
  },
};
