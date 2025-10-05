import { Entity } from "src/common/abstracts/entity";
import { Loan } from "src/features/loan/entities/loan.entity";
import { Supplier } from "src/features/supplier/entities/supplier.entity";
import { Company } from "src/foundations/company/entities/company.entity";

export type Equipment = Entity & {
  name: string;
  barcode?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  category?: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  status: string;

  company: Company;
  supplier: Supplier;
  loan?: Loan;
};
