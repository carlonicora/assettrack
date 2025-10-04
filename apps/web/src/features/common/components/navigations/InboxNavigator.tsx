"use client";

import { Badge } from "@/components/ui/badge";
import { useNotificationContext } from "@/features/foundations/notification/contexts/NotificationContext";
import { useTranslations } from "next-intl";

export default function InboxNavigator() {
  const t = useTranslations();
  const { notifications } = useNotificationContext();

  return (
    <div className="flex w-full flex-row items-center">
      <div className="flex w-full">{t(`foundations.notification.inbox`)}</div>
      {notifications.filter((notif) => !notif.isRead).length > 0 && (
        <Badge variant={`destructive`} className="ml-2 rounded-full">
          {notifications.filter((notif) => !notif.isRead).length}
        </Badge>
      )}
    </div>
  );
}
