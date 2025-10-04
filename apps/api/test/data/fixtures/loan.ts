import { COMPANIES } from "test/data/fixtures/company";
import { EMPLOYEES } from "test/data/fixtures/employee";
import { EQUIPMENTS } from "test/data/fixtures/equipment";

export const LOANS = {
  CompanyOne_Full: {
    id: "70080a8f-f41c-4c25-a4d2-bc0981e996fc",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Full,
    equipment: EQUIPMENTS.CompanyOne_Full,
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
  },
  CompanyOne_Nullable: {
    id: "2c02bb19-9201-40e3-8a3a-f7041e0793f0",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Nullable,
    equipment: EQUIPMENTS.CompanyOne_Nullable,
    startDate: new Date('2024-01-02T00:00:00.000Z'),
    endDate: null,
  },
  CompanyOne_Minimal: {
    id: "d8d8dbf1-f0a8-4830-a01e-bd30f7dc98c4",
    company: COMPANIES.CompanyOne,
    employee: EMPLOYEES.CompanyOne_Minimal,
    equipment: EQUIPMENTS.CompanyOne_Minimal,
    startDate: new Date('2024-01-03T00:00:00.000Z'),
    endDate: undefined,
  },
  CompanyTwo_Full: {
    id: "2dd8cb48-3aeb-41e8-95d8-a4a609b108d4",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Full,
    equipment: EQUIPMENTS.CompanyTwo_Full,
    startDate: new Date('2024-02-01T00:00:00.000Z'),
    endDate: new Date('2024-02-01T00:00:00.000Z'),
  },
  CompanyTwo_Nullable: {
    id: "330773b9-e847-4fb4-ab85-be553cf66e86",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Nullable,
    equipment: EQUIPMENTS.CompanyTwo_Nullable,
    startDate: new Date('2024-02-02T00:00:00.000Z'),
    endDate: null,
  },
  CompanyTwo_Minimal: {
    id: "90f84040-c889-4c72-8ea6-b9bce61556dc",
    company: COMPANIES.CompanyTwo,
    employee: EMPLOYEES.CompanyTwo_Minimal,
    equipment: EQUIPMENTS.CompanyTwo_Minimal,
    startDate: new Date('2024-02-03T00:00:00.000Z'),
    endDate: undefined,
  },
};