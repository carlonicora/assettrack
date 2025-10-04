"use client";

import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { UserService } from "@/features/foundations/user/data/UserService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";

import { Modules } from "@/modules/modules";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { UserFields } from "@/features/foundations/user/data/UserFields";
import "@/features/foundations/user/hooks/useUserTableStructure";
import { useTranslations } from "next-intl";

type RoleUsersListProps = {
  role: RoleInterface;
};

export default function RoleUsersList({ role }: RoleUsersListProps) {
  const t = useTranslations();

  const data: DataListRetriever<UserInterface> = useDataListRetriever({
    retriever: (params) => UserService.findAllUsersByRole(params),
    retrieverParams: { roleId: role.id },
    module: Modules.User,
  });

  return (
    <ContentListTable
      data={data}
      fields={[UserFields.name, UserFields.email]}
      tableGeneratorType={Modules.User}
      title={t(`types.users`, { count: 2 })}
    />
  );
}
