"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { UserFields } from "@/features/foundations/user/data/UserFields";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { DataListRetriever } from "@/hooks/useDataListRetriever";

import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactElement } from "react";

import "@/features/foundations/user/hooks/useUserTableStructure";

type UsersListProps = {
  data: DataListRetriever<UserInterface>;
  optionComponents?: ReactElement<any>[];
  removeFunction?: (user: UserInterface) => Promise<void>;
  hideOptions?: boolean;
  showRelevance?: boolean;
  restrictToJoinRequests?: boolean;
};

export default function UsersList({
  data,
  optionComponents,
  removeFunction,
  hideOptions,
  showRelevance,
}: UsersListProps) {
  const t = useTranslations();

  return (
    <ContentListTable
      data={data}
      fields={[UserFields.name, UserFields.email]}
      tableGeneratorType={Modules.User}
      title={t(`types.users`, { count: 2 })}
    />
  );
}
