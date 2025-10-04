import { SystemRoles } from "src/common/constants/system.role.id";

export const RoleId = {
  ...SystemRoles,
  HumanResource: "2684ce36-8692-47e2-b1e8-bb2b9e744f25",
  SalesManager: "b6fc8f03-f338-49b0-a5ab-740cb30837f2",
} as const;
