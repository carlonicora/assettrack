import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { ResourceValidator } from "test/jsonapi/JsonApiValidator";
import { standardMeta } from "test/jsonapi/validators/common";

export const supplierValidator: ResourceValidator = {
  type: supplierMeta.type,
  attributes: {
    name: {
      required: true,
    },
    address: {
    },
    email: {
    },
    phone: {
    },
  },
  meta: {
    ...standardMeta,
  },
  relationships: {
  },
};