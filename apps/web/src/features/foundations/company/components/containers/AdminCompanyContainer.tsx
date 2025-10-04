"use client";

import CompanyDetails from "@/features/foundations/company/components/details/CompanyDetails";
import { useCompanyContext } from "@/features/foundations/company/contexts/CompanyContext";
import AdminUsersList from "@/features/foundations/user/components/lists/AdminUsersList";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { AuthRole } from "@/permisions/enums/AuthRole";

export default function AdminCompanyContainer() {
  const { company } = useCompanyContext();
  const { hasRole } = useCurrentUserContext();

  if (!company || !hasRole(AuthRole.Administrator)) return null;

  return (
    <>
      <CompanyDetails />
      <AdminUsersList />
    </>
  );
}
