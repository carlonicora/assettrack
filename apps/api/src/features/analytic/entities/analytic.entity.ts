import { Entity } from "src/common/abstracts/entity";
import { Company } from "src/foundations/company/entities/company.entity";

export type Analytic = Entity & {
  equipment: number;
  loan: number;
  expiring30: number;
  expiring60: number;
  expiring90: number;
  expired: number;

  company: Company;
};
