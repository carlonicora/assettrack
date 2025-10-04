import { COMPANIES } from "test/data/fixtures/company";

export const EMPLOYEES = {
  CompanyOne_Full: {
    id: "183487ed-9173-419e-a810-efc1fb2149ac",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Full name",
    phone: "CompanyOne Employee Full phone",
    email: "CompanyOne Employee Full email",
    avatar: "CompanyOne Employee Full avatar",
  },
  CompanyOne_Nullable: {
    id: "1bd31e9f-826f-4d5a-84dd-6263b23a5a58",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyOne_Minimal: {
    id: "c9d1daaa-50f4-47b1-b030-02404538a0a3",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
  CompanyTwo_Full: {
    id: "e9e86676-be51-42f3-b64a-f4b481d67444",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Full name",
    phone: "CompanyTwo Employee Full phone",
    email: "CompanyTwo Employee Full email",
    avatar: "CompanyTwo Employee Full avatar",
  },
  CompanyTwo_Nullable: {
    id: "e8aa8b2d-a839-4fc6-b2fb-5b5ac11b6475",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyTwo_Minimal: {
    id: "bf77e6e9-abb0-4646-96c1-0a64b0296958",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
};