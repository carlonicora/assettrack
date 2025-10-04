import { Entity } from "src/common/abstracts/entity";
import { Company } from "src/foundations/company/entities/company.entity";

export type Supplier = Entity & {
  name: string;
  address?: string;
  email?: string;
  phone?: string;

  company: Company;
};