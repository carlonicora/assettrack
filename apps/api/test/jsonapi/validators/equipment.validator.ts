import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { ResourceValidator } from "test/jsonapi/JsonApiValidator";
import { standardMeta } from "test/jsonapi/validators/common";

export const equipmentValidator: ResourceValidator = {
  type: equipmentMeta.type,
  attributes: {
    name: {
      required: true,
    },
    barcode: {},
    description: {},
    startDate: {
      required: true,
      type: "date",
    },
    endDate: {
      required: true,
      type: "date",
    },
  },
  meta: {
    ...standardMeta,
  },
  relationships: {
    supplier: {
      type: supplierMeta.type,
    },
  },
};
