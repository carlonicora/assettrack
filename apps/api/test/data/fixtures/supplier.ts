import { COMPANIES } from "test/data/fixtures/company";

export const SUPPLIERS = {
  CompanyOne_Full: {
    id: "9bc0036a-f82f-44a6-9840-f78b750c1d9c",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Full name",
    address: "CompanyOne Supplier Full address",
    email: "CompanyOne Supplier Full email",
    phone: "CompanyOne Supplier Full phone",
  },
  CompanyOne_Nullable: {
    id: "4654b9b7-fb5c-4289-bbe4-5eb151d8fd44",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyOne_Minimal: {
    id: "a8bc1a77-ed57-400e-b059-c18b9094df1c",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
  CompanyTwo_Full: {
    id: "cc0b2cde-52b3-4e88-afe8-7e93dec968ed",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Full name",
    address: "CompanyTwo Supplier Full address",
    email: "CompanyTwo Supplier Full email",
    phone: "CompanyTwo Supplier Full phone",
  },
  CompanyTwo_Nullable: {
    id: "97a4f4a6-b8fd-4268-ab5d-17e2ce1a2c9f",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyTwo_Minimal: {
    id: "ed516ae6-79be-40af-8b75-cc7ff319acc6",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
};