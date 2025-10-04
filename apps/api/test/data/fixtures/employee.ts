import { COMPANIES } from "test/data/fixtures/company";

export const EMPLOYEES = {
  CompanyOne_Full: {
    id: "15af9c0c-5703-40d4-b8a0-85c07ad67d65",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Full name",
    phone: "CompanyOne Employee Full phone",
    email: "CompanyOne Employee Full email",
    avatar: "CompanyOne Employee Full avatar",
  },
  CompanyOne_Nullable: {
    id: "2fe09848-25c0-43e4-b9f8-5cebae0c297c",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyOne_Minimal: {
    id: "71b22e53-e56f-405b-9ebb-bdfbe5475ffb",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
  CompanyTwo_Full: {
    id: "9604a56d-cb84-44ee-be45-02407951660b",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Full name",
    phone: "CompanyTwo Employee Full phone",
    email: "CompanyTwo Employee Full email",
    avatar: "CompanyTwo Employee Full avatar",
  },
  CompanyTwo_Nullable: {
    id: "29f60b23-f4bd-4991-90eb-b01ce9b17d31",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyTwo_Minimal: {
    id: "332547e5-b67e-4ae7-a727-2ddecab10eaa",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
};