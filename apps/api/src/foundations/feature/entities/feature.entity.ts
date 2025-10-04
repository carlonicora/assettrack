import { Entity } from "src/common/abstracts/entity";
import { Module } from "src/foundations/module/entities/module.entity";

export type Feature = Entity & {
  name: string;
  isProduction: boolean;
  module: Module[];
};
