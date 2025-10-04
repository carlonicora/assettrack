import { Company } from "@/features/foundations/company/data/Company";
import { FactoryType } from "@/permisions/types";

export const CompanyModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/companies",
    name: "companies",
    model: Company,
    moduleId: "f9e77c8f-bfd1-4fd4-80b0-e1d891ab7113",
  });
