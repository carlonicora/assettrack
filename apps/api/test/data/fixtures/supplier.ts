import { COMPANIES } from "test/data/fixtures/company";

export const SUPPLIERS = {
  CompanyOne_Full: {
    id: "065e7ea0-4ef5-4429-9f86-1e7ae6b782f1",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Full name",
    address: "CompanyOne Supplier Full address",
    email: "CompanyOne Supplier Full email",
    phone: "CompanyOne Supplier Full phone",
  },
  CompanyOne_Nullable: {
    id: "65130f49-bf6c-4c7a-953c-8b6d96f8c96e",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyOne_Minimal: {
    id: "d5e9d620-a8f2-4507-82fd-0a2801d74bf1",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
  CompanyTwo_Full: {
    id: "eb5efa9b-2268-474b-86b1-7cd2710246ae",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Full name",
    address: "CompanyTwo Supplier Full address",
    email: "CompanyTwo Supplier Full email",
    phone: "CompanyTwo Supplier Full phone",
  },
  CompanyTwo_Nullable: {
    id: "92e1dbad-fa55-48c6-89da-14b6180a328c",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyTwo_Minimal: {
    id: "c8da45c6-556b-4a38-9196-15097394d0aa",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
};