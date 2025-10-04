"use client";

import CommonDeleter from "@/features/common/components/forms/CommonDeleter";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { UserService } from "@/features/foundations/user/data/UserService";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { useRouter } from "@/i18n/routing";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type UserDeleterProps = {
  user: UserInterface;
  companyId?: string;
  onDeleted?: () => void;
};

function UserDeleterInternal({ user, onDeleted, companyId }: UserDeleterProps) {
  const { currentUser, company } = useCurrentUserContext();
  const generateUrl = usePageUrlGenerator();
  const router = useRouter();
  const t = useTranslations();

  let cId;
  if (currentUser?.roles.find((role) => role.id === AuthRole.Administrator) && companyId) {
    cId = companyId;
  } else {
    if (!company) return;
    cId = company.id;
  }

  return (
    <CommonDeleter
      title={t(`foundations.user.delete.title`)}
      subtitle={t(`foundations.user.delete.subtitle`)}
      description={t(`foundations.user.delete.description`)}
      deleteFunction={() =>
        UserService.delete({ userId: user.id, companyId: cId }).then(() =>
          onDeleted ? onDeleted() : router.push(generateUrl({ page: Modules.User })),
        )
      }
    />
  );
}

export default function UserDeleter(props: UserDeleterProps) {
  return withPermissions({
    Component: UserDeleterInternal,
    modules: [Modules.User],
    action: Action.Delete,
    data: props.user,
  })(props);
}
