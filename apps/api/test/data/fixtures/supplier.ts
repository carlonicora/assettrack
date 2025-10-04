import { COMPANIES } from "test/data/fixtures/company";

export const SUPPLIERS = {
  CompanyOne_Full: {
    id: "5bf2dd48-39a7-413d-b46e-fe83b68ebe93",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Full name",
    address: "CompanyOne Supplier Full address",
    email: "CompanyOne Supplier Full email",
    phone: "CompanyOne Supplier Full phone",
  },
  CompanyOne_Nullable: {
    id: "5d7d5608-d555-4400-8ad9-483d08bf1808",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyOne_Minimal: {
    id: "0e741348-41fa-4061-bf98-c534060f3979",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
  CompanyTwo_Full: {
    id: "a6995d7d-9859-4a39-981a-26bb7324bb19",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Full name",
    address: "CompanyTwo Supplier Full address",
    email: "CompanyTwo Supplier Full email",
    phone: "CompanyTwo Supplier Full phone",
  },
  CompanyTwo_Nullable: {
    id: "87971618-67ab-4153-9068-af1705abbee6",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyTwo_Minimal: {
    id: "bc99b52b-00ff-4ddc-9824-dd7163438acf",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
};