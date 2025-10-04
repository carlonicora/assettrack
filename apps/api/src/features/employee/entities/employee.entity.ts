import { Entity } from "src/common/abstracts/entity";
import { Company } from "src/foundations/company/entities/company.entity";

export type Employee = Entity & {
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;

  company: Company;
};