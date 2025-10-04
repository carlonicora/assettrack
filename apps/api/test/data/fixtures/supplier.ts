import { COMPANIES } from "test/data/fixtures/company";

export const SUPPLIERS = {
  CompanyOne_Full: {
    id: "40b95e8a-7664-4b46-ae53-05ce14c8d811",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Full name",
    address: "CompanyOne Supplier Full address",
    email: "CompanyOne Supplier Full email",
    phone: "CompanyOne Supplier Full phone",
  },
  CompanyOne_Nullable: {
    id: "c5ab30ad-ae4d-48db-a651-98d693bae9b8",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyOne_Minimal: {
    id: "127e2688-1bf4-4af5-8975-47a06d50c063",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
  CompanyTwo_Full: {
    id: "f7638208-1f00-40b6-9eaf-77749c85dd6b",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Full name",
    address: "CompanyTwo Supplier Full address",
    email: "CompanyTwo Supplier Full email",
    phone: "CompanyTwo Supplier Full phone",
  },
  CompanyTwo_Nullable: {
    id: "28c9ee99-bcfb-4783-96d1-b49f4bb45ba7",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyTwo_Minimal: {
    id: "db273ac3-3e63-4d08-b0b5-8447c11c44cf",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
};