import { Entity } from "src/common/abstracts/entity";
import { Supplier } from "src/features/supplier/entities/supplier.entity";
import { Company } from "src/foundations/company/entities/company.entity";

export type Equipment = Entity & {
  name: string;
  barcode?: string;
  description?: string;
  startDate: Date;
  endDate: Date;

  company: Company;
  supplier: Supplier;
};