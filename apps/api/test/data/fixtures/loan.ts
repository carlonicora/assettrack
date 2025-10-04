import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const LOANS = {
  CompanyOne_Full: {
    id: "52ed2ec7-2d46-4501-b334-90f7875517f4",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Full,
    equipment: EQUIPMENTS.CompanyOne_Full,
    name: "CompanyOne Loan Full name",
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
  },
  CompanyOne_Nullable: {
    id: "97034800-db17-4b8c-b6fe-df11a483b65a",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Nullable,
    equipment: EQUIPMENTS.CompanyOne_Nullable,
    name: "CompanyOne Loan Nullable name",
    startDate: new Date('2024-01-02T00:00:00.000Z'),
    endDate: new Date('2024-01-02T00:00:00.000Z'),
  },
  CompanyOne_Minimal: {
    id: "8e2184fd-a216-4924-ba47-ebfce2b5dd0f",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Minimal,
    equipment: EQUIPMENTS.CompanyOne_Minimal,
    name: "CompanyOne Loan Minimal name",
    startDate: new Date('2024-01-03T00:00:00.000Z'),
    endDate: new Date('2024-01-03T00:00:00.000Z'),
  },
  CompanyTwo_Full: {
    id: "0cec1887-087d-4d98-925f-5e8f51aad349",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Full,
    equipment: EQUIPMENTS.CompanyTwo_Full,
    name: "CompanyTwo Loan Full name",
    startDate: new Date('2024-02-01T00:00:00.000Z'),
    endDate: new Date('2024-02-01T00:00:00.000Z'),
  },
  CompanyTwo_Nullable: {
    id: "34ceb461-a477-4f59-aad2-29c7a0e73f53",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Nullable,
    equipment: EQUIPMENTS.CompanyTwo_Nullable,
    name: "CompanyTwo Loan Nullable name",
    startDate: new Date('2024-02-02T00:00:00.000Z'),
    endDate: new Date('2024-02-02T00:00:00.000Z'),
  },
  CompanyTwo_Minimal: {
    id: "2eaf923d-7925-42b3-9fe2-db8690512e5d",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Minimal,
    equipment: EQUIPMENTS.CompanyTwo_Minimal,
    name: "CompanyTwo Loan Minimal name",
    startDate: new Date('2024-02-03T00:00:00.000Z'),
    endDate: new Date('2024-02-03T00:00:00.000Z'),
  },
};