import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const LOANS = {
  CompanyOne_Full: {
    id: "c7d4b4f6-0d38-409c-95ec-c73d519ee869",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Full,
    equipment: EQUIPMENTS.CompanyOne_Full,
    name: "CompanyOne Loan Full name",
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
  },
  CompanyOne_Nullable: {
    id: "5df85926-3520-4c3e-b608-b1eacee9e945",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Nullable,
    equipment: EQUIPMENTS.CompanyOne_Nullable,
    name: "CompanyOne Loan Nullable name",
    startDate: new Date('2024-01-02T00:00:00.000Z'),
    endDate: new Date('2024-01-02T00:00:00.000Z'),
  },
  CompanyOne_Minimal: {
    id: "75e1fc2d-65e0-45ae-a303-a62367f0b95e",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Minimal,
    equipment: EQUIPMENTS.CompanyOne_Minimal,
    name: "CompanyOne Loan Minimal name",
    startDate: new Date('2024-01-03T00:00:00.000Z'),
    endDate: new Date('2024-01-03T00:00:00.000Z'),
  },
  CompanyTwo_Full: {
    id: "98e39f9f-0b57-48ac-959e-da8bfb7a83d1",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Full,
    equipment: EQUIPMENTS.CompanyTwo_Full,
    name: "CompanyTwo Loan Full name",
    startDate: new Date('2024-02-01T00:00:00.000Z'),
    endDate: new Date('2024-02-01T00:00:00.000Z'),
  },
  CompanyTwo_Nullable: {
    id: "b6bed58b-f39e-4682-bfb3-079000ede0da",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Nullable,
    equipment: EQUIPMENTS.CompanyTwo_Nullable,
    name: "CompanyTwo Loan Nullable name",
    startDate: new Date('2024-02-02T00:00:00.000Z'),
    endDate: new Date('2024-02-02T00:00:00.000Z'),
  },
  CompanyTwo_Minimal: {
    id: "44dbc8ad-9185-4e81-959b-21066623ec61",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Minimal,
    equipment: EQUIPMENTS.CompanyTwo_Minimal,
    name: "CompanyTwo Loan Minimal name",
    startDate: new Date('2024-02-03T00:00:00.000Z'),
    endDate: new Date('2024-02-03T00:00:00.000Z'),
  },
};