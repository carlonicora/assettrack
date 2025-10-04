import { Entity } from "src/common/abstracts/entity";
import { Employee } from "src/features/employee/entities/employee.entity";
import { Equipment } from "src/features/equipment/entities/equipment.entity";
import { Company } from "src/foundations/company/entities/company.entity";

export type Loan = Entity & {
  startDate: Date;
  endDate?: Date;

  company: Company;
  employee: Employee;
  equipment: Equipment;
};