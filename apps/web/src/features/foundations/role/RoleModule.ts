import { Role } from "@/features/foundations/role/data/Role";
import { FactoryType } from "@/permisions/types";

export const RoleModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/roles",
    name: "roles",
    model: Role,
    moduleId: "9f6416e6-7b9b-4e1a-a99f-833191eca8a9",
  });
