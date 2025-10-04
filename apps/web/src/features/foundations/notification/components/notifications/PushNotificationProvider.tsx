"use client";

import usePushNotifications from "@/hooks/usePushNotifications";
import { ReactNode, type JSX } from "react";

export default function PushNotificationProvider({ children }: { children: ReactNode }): JSX.Element {
  usePushNotifications();
  return <>{children}</>;
}
