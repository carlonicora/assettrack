import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const LOANS = {
  CompanyOne_Full: {
    id: "601a92be-95c3-48c8-9cde-9c862ef2ba82",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Full,
    equipment: EQUIPMENTS.CompanyOne_Full,
    name: "CompanyOne Loan Full name",
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
  },
  CompanyOne_Nullable: {
    id: "50f612cc-89bc-4098-89e2-e8bcfccf9217",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Nullable,
    equipment: EQUIPMENTS.CompanyOne_Nullable,
    name: "CompanyOne Loan Nullable name",
    startDate: new Date('2024-01-02T00:00:00.000Z'),
    endDate: new Date('2024-01-02T00:00:00.000Z'),
  },
  CompanyOne_Minimal: {
    id: "7bddf026-2bc5-4fda-98df-c22ecfa7530e",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Minimal,
    equipment: EQUIPMENTS.CompanyOne_Minimal,
    name: "CompanyOne Loan Minimal name",
    startDate: new Date('2024-01-03T00:00:00.000Z'),
    endDate: new Date('2024-01-03T00:00:00.000Z'),
  },
  CompanyTwo_Full: {
    id: "5d7e0364-ffa6-4519-9552-8f35b323d419",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Full,
    equipment: EQUIPMENTS.CompanyTwo_Full,
    name: "CompanyTwo Loan Full name",
    startDate: new Date('2024-02-01T00:00:00.000Z'),
    endDate: new Date('2024-02-01T00:00:00.000Z'),
  },
  CompanyTwo_Nullable: {
    id: "3479d1db-1b34-4d76-a9b2-a1cf49b4aa50",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Nullable,
    equipment: EQUIPMENTS.CompanyTwo_Nullable,
    name: "CompanyTwo Loan Nullable name",
    startDate: new Date('2024-02-02T00:00:00.000Z'),
    endDate: new Date('2024-02-02T00:00:00.000Z'),
  },
  CompanyTwo_Minimal: {
    id: "27f022ef-c719-4f0b-84ea-1362eacc93e4",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Minimal,
    equipment: EQUIPMENTS.CompanyTwo_Minimal,
    name: "CompanyTwo Loan Minimal name",
    startDate: new Date('2024-02-03T00:00:00.000Z'),
    endDate: new Date('2024-02-03T00:00:00.000Z'),
  },
};