import { Push } from "@/features/foundations/push/data/Push";
import { FactoryType } from "@/permisions/types";

export const PushModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/push",
    name: "push",
    model: Push,
    moduleId: "",
  });
