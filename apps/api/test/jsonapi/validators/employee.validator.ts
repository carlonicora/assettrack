import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { ResourceValidator } from "test/jsonapi/JsonApiValidator";
import { standardMeta } from "test/jsonapi/validators/common";

export const employeeValidator: ResourceValidator = {
  type: employeeMeta.type,
  attributes: {
    name: {
      required: true,
    },
    phone: {
    },
    email: {
    },
    avatar: {
    },
  },
  meta: {
    ...standardMeta,
  },
  relationships: {
  },
};