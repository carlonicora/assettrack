"use client";

import { useSocketContext } from "@/contexts/SocketContext";
import { useNotificationContext } from "@/features/foundations/notification/contexts/NotificationContext";
import { useEffect } from "react";

export function useNotificationSync() {
  const { socketNotifications, clearSocketNotifications } = useSocketContext();
  const { addSocketNotifications } = useNotificationContext();

  useEffect(() => {
    if (socketNotifications.length > 0) {
      try {
        addSocketNotifications(socketNotifications);
        clearSocketNotifications();
      } catch (error) {
        console.error("💥 [useNotificationSync] Error processing notifications:", error);
      }
    }
  }, [socketNotifications, addSocketNotifications, clearSocketNotifications]);
}
