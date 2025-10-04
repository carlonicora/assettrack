"use client";

import CommonSidebar from "@/features/common/components/navigations/CommonSidebar";
import { useNotificationContext } from "@/features/foundations/notification/contexts/NotificationContext";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { useNotificationSync } from "@/hooks/useNotificationSync";
import { usePageTracker } from "@/hooks/usePageTracker";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { useEffect } from "react";

type LayoutDetailsProps = { children: React.ReactNode };

export default function LayoutDetails({ children }: LayoutDetailsProps) {
  // Notification functionality enabled

  const { currentUser } = useCurrentUserContext();
  const { loadNotifications } = useNotificationContext();

  useNotificationSync();
  usePageTracker();

  useEffect(() => {
    if (currentUser && !currentUser.roles?.find((role: RoleInterface) => role.id === AuthRole.Administrator)) {
      loadNotifications();
    }
  }, [currentUser, loadNotifications]);

  return (
    <div data-wrapper className="flex h-full w-full">
      <CommonSidebar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
