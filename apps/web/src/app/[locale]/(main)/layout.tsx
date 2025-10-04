import { ServerSession } from "@/contexts/ServerSession";
import "react-horizontal-scrolling-menu/dist/styles.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SocketProvider } from "@/contexts/SocketContext";
import LayoutDetails from "@/features/common/components/details/LayoutDetails";
import RefreshUser from "@/features/foundations/auth/components/forms/RefreshUser";
import PushNotificationProvider from "@/features/foundations/notification/components/notifications/PushNotificationProvider";
import { NotificationContextProvider } from "@/features/foundations/notification/contexts/NotificationContext";
import { cookies } from "next/headers";

export default async function MainLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { children } = props;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  if (await ServerSession.isLogged()) {
    // if (await ServerSession.isLicenseActive())
    return (
      <SocketProvider token={token}>
        <PushNotificationProvider>
          <NotificationContextProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <RefreshUser />
              <LayoutDetails>{children}</LayoutDetails>
            </SidebarProvider>
          </NotificationContextProvider>
        </PushNotificationProvider>
      </SocketProvider>
    );

    // return <CompanyLicense />;
  }

  return <div className="flex min-h-screen w-full flex-col items-center justify-center">{children}</div>;
}
