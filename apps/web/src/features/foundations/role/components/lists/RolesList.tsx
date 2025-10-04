"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { RoleFields } from "@/features/foundations/role/data/RoleFields";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { RoleService } from "@/features/foundations/role/data/RoleService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";

import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";

export default function RolesList() {
  const t = useTranslations();

  const data: DataListRetriever<RoleInterface> = useDataListRetriever({
    retriever: (params) => RoleService.findAllRoles(params),
    retrieverParams: {},
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
