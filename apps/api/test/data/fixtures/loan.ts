import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const LOANS = {
  CompanyOne_Full: {
    id: "1a35a818-90e8-4a32-9e21-777a8019627f",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Full,
    equipment: EQUIPMENTS.CompanyOne_Full,
    name: "CompanyOne Loan Full name",
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
  },
  CompanyOne_Nullable: {
    id: "eb928544-27c6-4244-93ad-962d226b6377",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Nullable,
    equipment: EQUIPMENTS.CompanyOne_Nullable,
    name: "CompanyOne Loan Nullable name",
    startDate: new Date('2024-01-02T00:00:00.000Z'),
    endDate: new Date('2024-01-02T00:00:00.000Z'),
  },
  CompanyOne_Minimal: {
    id: "12684119-29da-4032-a069-d73606631e79",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Minimal,
    equipment: EQUIPMENTS.CompanyOne_Minimal,
    name: "CompanyOne Loan Minimal name",
    startDate: new Date('2024-01-03T00:00:00.000Z'),
    endDate: new Date('2024-01-03T00:00:00.000Z'),
  },
  CompanyTwo_Full: {
    id: "ede4c1fb-8472-4c66-bf89-0bac2af192a8",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Full,
    equipment: EQUIPMENTS.CompanyTwo_Full,
    name: "CompanyTwo Loan Full name",
    startDate: new Date('2024-02-01T00:00:00.000Z'),
    endDate: new Date('2024-02-01T00:00:00.000Z'),
  },
  CompanyTwo_Nullable: {
    id: "c4c0ce61-fc40-4838-8876-51daf670e6a4",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Nullable,
    equipment: EQUIPMENTS.CompanyTwo_Nullable,
    name: "CompanyTwo Loan Nullable name",
    startDate: new Date('2024-02-02T00:00:00.000Z'),
    endDate: new Date('2024-02-02T00:00:00.000Z'),
  },
  CompanyTwo_Minimal: {
    id: "08bd89d9-c337-47c9-bcc4-785c6821b209",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Minimal,
    equipment: EQUIPMENTS.CompanyTwo_Minimal,
    name: "CompanyTwo Loan Minimal name",
    startDate: new Date('2024-02-03T00:00:00.000Z'),
    endDate: new Date('2024-02-03T00:00:00.000Z'),
  },
};