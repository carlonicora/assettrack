import { Equipment } from "@/features/features/equipment/data/Equipment";
import { createJsonApiInclusion } from "@/jsonApi/FieldSelector";
import { FactoryType } from "@/permisions/types";

export const EquipmentModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/equipments",
    name: "equipments",
    model: Equipment,
    moduleId: "8e5d7513-58a0-40c6-83d1-4a3bf7744853",
    inclusions: {
      lists: {
        fields: [createJsonApiInclusion("equipments", [`name`,`barcode`,`description`,`startDate`,`endDate`])],
      },
    },
  });
