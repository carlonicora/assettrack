import { Employee } from "@/features/features/employee/data/Employee";
import { createJsonApiInclusion } from "@/jsonApi/FieldSelector";
import { FactoryType } from "@/permisions/types";

export const EmployeeModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/employees",
    name: "employees",
    model: Employee,
    moduleId: "ce64ac33-8d42-4178-97ec-902979cd461a",
    inclusions: {
      lists: {
        fields: [createJsonApiInclusion("employees", [`name`,`phone`,`email`,`avatar`])],
      },
    },
  });
