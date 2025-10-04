import { Module } from "@/features/foundations/module/data/Module";
import { FactoryType } from "@/permisions/types";

export const ModuleModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/modules",
    name: "modules",
    model: Module,
    moduleId: "25ffd868-8341-4ca7-963b-6e1c56b03b1d",
  });
