import { COMPANIES } from "test/data/fixtures/company";

export const EMPLOYEES = {
  CompanyOne_Full: {
    id: "85199e53-bd26-43d5-9bdb-16fc37e212b1",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Full name",
    phone: "CompanyOne Employee Full phone",
    email: "CompanyOne Employee Full email",
    avatar: "CompanyOne Employee Full avatar",
  },
  CompanyOne_Nullable: {
    id: "ccc6a818-08c6-4b27-899c-57106d9b3a15",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyOne_Minimal: {
    id: "05e8883e-f35f-4318-971a-797f622bc78d",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
  CompanyTwo_Full: {
    id: "5eaa07ad-5165-4e37-bd74-0e55efabb01c",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Full name",
    phone: "CompanyTwo Employee Full phone",
    email: "CompanyTwo Employee Full email",
    avatar: "CompanyTwo Employee Full avatar",
  },
  CompanyTwo_Nullable: {
    id: "bce2f445-d500-4a65-ba3c-1c736f2bcc3a",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyTwo_Minimal: {
    id: "71809341-7b02-444c-a25d-872395749dba",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
};