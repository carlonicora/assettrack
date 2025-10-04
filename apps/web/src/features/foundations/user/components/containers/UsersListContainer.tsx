"use client";

import TabsContainer, { Tab } from "@/features/common/components/containers/TabsContainer";
import CompanyUsersList from "@/features/foundations/user/components/lists/CompanyUsersList";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

function UsersListContainerInternal() {
  const { hasPermissionToModule } = useCurrentUserContext();
  const t = useTranslations();

  if (!hasPermissionToModule({ module: Modules.User, action: Action.Delete })) return <CompanyUsersList />;

  const tabs: Tab[] = [
    {
      label: t(`types.users`, { count: 2 }),
      content: <CompanyUsersList />,
      modules: [Modules.Company],
      action: Action.Read,
    },
    {
      label: t(`foundations.user.deleted`),
      content: <CompanyUsersList isDeleted={true} />,
      modules: [Modules.Company],
      action: Action.Update,
    },
  ];

  return <TabsContainer tabs={tabs} />;
}

export default function UsersListContainer() {
  const Response = withPermissions({
    Component: UsersListContainerInternal,
    modules: [Modules.User],
    action: Action.Read,
  });

  return <Response />;
}
