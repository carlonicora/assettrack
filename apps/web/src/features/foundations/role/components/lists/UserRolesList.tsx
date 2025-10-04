"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { RoleFields } from "@/features/foundations/role/data/RoleFields";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { RoleService } from "@/features/foundations/role/data/RoleService";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";

import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";

type UserRolesListProps = {
  user: UserInterface;
};

export default function UserRolesList({ user }: UserRolesListProps) {
  const t = useTranslations();

  const data: DataListRetriever<RoleInterface> = useDataListRetriever({
    retriever: (params) => RoleService.findAllRolesByUser(params),
    retrieverParams: { userId: user.id },
    module: Modules.Role,
  });

  return (
    <ContentListTable
      data={data}
      fields={[RoleFields.name, RoleFields.description]}
      tableGeneratorType={Modules.Role}
      title={t(`types.roles`, { count: 2 })}
    />
  );
}
