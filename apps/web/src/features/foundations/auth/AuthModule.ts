import { Auth } from "@/features/foundations/auth/data/Auth";
import { FactoryType } from "@/permisions/types";

export const AuthModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/auth",
    name: "auth",
    model: Auth,
  });
