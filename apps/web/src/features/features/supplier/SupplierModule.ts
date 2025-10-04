import { Supplier } from "@/features/features/supplier/data/Supplier";
import { createJsonApiInclusion } from "@/jsonApi/FieldSelector";
import { FactoryType } from "@/permisions/types";

export const SupplierModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/suppliers",
    name: "suppliers",
    model: Supplier,
    moduleId: "92026e55-4f3a-4782-823a-b44ad5ca1b04",
    inclusions: {
      lists: {
        fields: [createJsonApiInclusion("suppliers", [`name`,`address`,`email`,`phone`])],
      },
    },
  });
