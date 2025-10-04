import { Entity } from "src/common/abstracts/entity";
import { Company } from "src/foundations/company/entities/company.entity";
import { Module } from "src/foundations/module/entities/module.entity";
import { Role } from "src/foundations/role/entities/role.entity";

export type User = Entity & {
  email: string;
  name?: string;
  title?: string;
  bio?: string;
  password?: string;
  avatar?: string;
  phone?: string;
  rate?: number;

  isActive: boolean;
  lastLogin?: Date;
  isDeleted: boolean;

  code?: string;
  codeExpiration?: Date;

  role?: Role[];
  company?: Company;
  module?: Module[];
};
