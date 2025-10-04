import { User } from "@/features/foundations/user/data/User";
import { FactoryType } from "@/permisions/types";

export const UserModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/users",
    name: "users",
    model: User,
    moduleId: "04cfc677-0fd2-4f5e-adf4-2483a00c0277",
  });
