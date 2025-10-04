"use client";

import RoleDetails from "@/features/foundations/role/components/details/RoleDetails";
import { useRoleContext } from "@/features/foundations/role/contexts/RoleContext";
import RoleUsersList from "@/features/foundations/user/components/lists/RoleUsersList";

export default function RoleContainer() {
  const { role } = useRoleContext();

  if (!role) return null;

  return (
    <>
      <RoleDetails />
      <RoleUsersList role={role} />
    </>
  );
}
