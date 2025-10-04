import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Employee } from "src/features/employee/entities/employee.entity";
import { mapEmployee } from "src/features/employee/entities/employee.map";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { EmployeeSerialiser } from "src/features/employee/serialisers/employee.serialiser";
import { companyMeta } from "src/foundations/company/entities/company.meta";

export const EmployeeModel: DataModelInterface<Employee> = {
  ...employeeMeta,
  entity: undefined as unknown as Employee,
  mapper: mapEmployee,
  serialiser: EmployeeSerialiser,
  singleChildrenTokens: [companyMeta.nodeName,],
  childrenTokens: []
};