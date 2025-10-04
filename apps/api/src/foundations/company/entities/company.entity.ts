import { Entity } from "src/common/abstracts/entity";
import { Feature } from "src/foundations/feature/entities/feature.entity";
import { Module } from "src/foundations/module/entities/module.entity";

export type Company = Entity & {
  name: string;
  logo?: string;
  logoUrl?: string;
  availableTokens: number;

  licenseExpirationDate?: Date;

  feature: Feature[];
  module: Module[];
};
