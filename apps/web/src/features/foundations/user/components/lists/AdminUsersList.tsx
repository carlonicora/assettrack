"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { useCompanyContext } from "@/features/foundations/company/contexts/CompanyContext";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import UserEditor from "@/features/foundations/user/components/forms/UserEditor";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { UserFields } from "@/features/foundations/user/data/UserFields";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { UserService } from "@/features/foundations/user/data/UserService";
import "@/features/foundations/user/hooks/useUserTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";

import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type AdminUsersListProps = {
  company: CompanyInterface;
};

function AdminUsersListInternal({ company }: AdminUsersListProps) {
  const t = useTranslations();

  const data: DataListRetriever<UserInterface> = useDataListRetriever({
    retriever: (params) => UserService.findManyForAmin(params),
    retrieverParams: { companyId: company.id },
    module: Modules.User,
  });

  return (
    <ContentListTable
      title={t(`types.users`, { count: 2 })}
      data={data}
      fields={[UserFields.name, UserFields.email, UserFields.createdAt]}
      tableGeneratorType={Modules.User}
      functions={<UserEditor propagateChanges={data.refresh} adminCreated />}
    />
  );
}

export default function AdminUsersList() {
  const { company } = useCompanyContext();
  const { hasRole } = useCurrentUserContext();

  if (!company) return null;

  if (hasRole(AuthRole.Administrator)) return <AdminUsersListInternal company={company} />;

  return withPermissions({
    Component: AdminUsersListInternal,
    modules: [Modules.Company],
    action: Action.Delete,
  })({ company });
}
