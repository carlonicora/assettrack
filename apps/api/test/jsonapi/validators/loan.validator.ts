import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import { ResourceValidator } from "test/jsonapi/JsonApiValidator";
import { standardMeta } from "test/jsonapi/validators/common";

export const loanValidator: ResourceValidator = {
  type: loanMeta.type,
  attributes: {
    startDate: {
      required: true,
      type: "date",
    },
    endDate: {
      type: "date",
    },
  },
  meta: {
    ...standardMeta,
  },
  relationships: {
    employee: {
      type: employeeMeta.type,
    },
    equipment: {
      type: equipmentMeta.type,
    },
  },
};