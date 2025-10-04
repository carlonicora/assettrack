import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const LOANS = {
  CompanyOne_Full: {
    id: "382f3c5b-2246-4640-b465-c9be0676b31b",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Full,
    equipment: EQUIPMENTS.CompanyOne_Full,
    name: "CompanyOne Loan Full name",
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
  },
  CompanyOne_Nullable: {
    id: "d6212e13-c72a-4484-b4bd-79cb5b7a1e9b",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Nullable,
    equipment: EQUIPMENTS.CompanyOne_Nullable,
    name: "CompanyOne Loan Nullable name",
    startDate: new Date('2024-01-02T00:00:00.000Z'),
    endDate: new Date('2024-01-02T00:00:00.000Z'),
  },
  CompanyOne_Minimal: {
    id: "b95132ac-72c1-4ab1-b2f9-703d9567910c",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Minimal,
    equipment: EQUIPMENTS.CompanyOne_Minimal,
    name: "CompanyOne Loan Minimal name",
    startDate: new Date('2024-01-03T00:00:00.000Z'),
    endDate: new Date('2024-01-03T00:00:00.000Z'),
  },
  CompanyTwo_Full: {
    id: "8ef2c3af-38df-4499-905b-4c4859fc1f9f",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Full,
    equipment: EQUIPMENTS.CompanyTwo_Full,
    name: "CompanyTwo Loan Full name",
    startDate: new Date('2024-02-01T00:00:00.000Z'),
    endDate: new Date('2024-02-01T00:00:00.000Z'),
  },
  CompanyTwo_Nullable: {
    id: "b7f5b8e2-1b2a-4a02-8eb1-ab49ba37281d",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Nullable,
    equipment: EQUIPMENTS.CompanyTwo_Nullable,
    name: "CompanyTwo Loan Nullable name",
    startDate: new Date('2024-02-02T00:00:00.000Z'),
    endDate: new Date('2024-02-02T00:00:00.000Z'),
  },
  CompanyTwo_Minimal: {
    id: "87f5151a-7a07-45f2-906b-b9ad2817123a",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Minimal,
    equipment: EQUIPMENTS.CompanyTwo_Minimal,
    name: "CompanyTwo Loan Minimal name",
    startDate: new Date('2024-02-03T00:00:00.000Z'),
    endDate: new Date('2024-02-03T00:00:00.000Z'),
  },
};