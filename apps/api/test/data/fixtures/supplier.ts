import { COMPANIES } from "test/data/fixtures/company";

export const SUPPLIERS = {
  CompanyOne_Full: {
    id: "fd44c25e-2aa8-47f0-8afd-56b5605e0e36",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Full name",
    address: "CompanyOne Supplier Full address",
    email: "CompanyOne Supplier Full email",
    phone: "CompanyOne Supplier Full phone",
  },
  CompanyOne_Nullable: {
    id: "6fdef03e-1afd-466d-b2e6-2c706785ec92",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyOne_Minimal: {
    id: "aaeeb28e-982a-4bd1-8188-40a54f8cae0d",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
  CompanyTwo_Full: {
    id: "7c7a8fd5-eff6-49f0-9726-24d8d329f641",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Full name",
    address: "CompanyTwo Supplier Full address",
    email: "CompanyTwo Supplier Full email",
    phone: "CompanyTwo Supplier Full phone",
  },
  CompanyTwo_Nullable: {
    id: "663205d2-5368-47c4-aed4-b2d2a716e0a4",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Nullable name",
    address: null,
    email: null,
    phone: null,
  },
  CompanyTwo_Minimal: {
    id: "d6793929-d677-43b7-9db6-1f9b3ced4edd",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Supplier Minimal name",
    address: undefined,
    email: undefined,
    phone: undefined,
  },
};
