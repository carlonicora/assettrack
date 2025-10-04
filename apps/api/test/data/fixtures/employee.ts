import { COMPANIES } from "test/data/fixtures/company";

export const EMPLOYEES = {
  CompanyOne_Full: {
    id: "a1b55d3f-ea74-4662-8844-a73a1ec5ef91",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Full name",
    phone: "CompanyOne Employee Full phone",
    email: "CompanyOne Employee Full email",
    avatar: "CompanyOne Employee Full avatar",
  },
  CompanyOne_Nullable: {
    id: "50613b69-1117-4c75-9bb0-8775c939e617",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyOne_Minimal: {
    id: "f9c3702a-0963-4cd3-a16c-546375ecdfce",
    company: COMPANIES.CompanyOne,
    name: "CompanyOne Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
  CompanyTwo_Full: {
    id: "e6b2a071-02c0-4794-a64b-a0788a3e75a8",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Full name",
    phone: "CompanyTwo Employee Full phone",
    email: "CompanyTwo Employee Full email",
    avatar: "CompanyTwo Employee Full avatar",
  },
  CompanyTwo_Nullable: {
    id: "630d80d0-3cef-4e6b-966a-05f18cf13f07",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Nullable name",
    phone: null,
    email: null,
    avatar: null,
  },
  CompanyTwo_Minimal: {
    id: "11f88da0-55d1-40cb-8446-af85e04d0985",
    company: COMPANIES.CompanyTwo,
    name: "CompanyTwo Employee Minimal name",
    phone: undefined,
    email: undefined,
    avatar: undefined,
  },
};