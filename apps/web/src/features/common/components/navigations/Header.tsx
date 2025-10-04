"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Breadcrumb from "@/features/common/components/navigations/Breadcrumb";
import { useSharedContext } from "@/features/common/contexts/SharedContext";
import dynamic from "next/dynamic";

const PageNavigationMenu = dynamic(() => import("@/features/common/components/navigations/PageNavigationMenu"), {
  ssr: false,
});

export default function Header() {
  const { breadcrumbs } = useSharedContext();

  return (
    <header className={`sticky top-0 z-10 flex h-12 flex-col items-center justify-start gap-x-4 border-b`}>
      <div className="bg-card flex h-12 w-full flex-row items-center justify-between pr-4 pl-2">
        <SidebarTrigger aria-label="Toggle sidebar" />
        {/* <NavigationMenu delayDuration={0} className={`flex w-full max-w-full flex-row`} suppressHydrationWarning> */}
        {/* <PageNavigationMenu /> */}
        <div className="flex w-full flex-row items-center justify-start">
          <Breadcrumb items={breadcrumbs} />
        </div>
        {/* <div className="flex w-64 flex-row items-center justify-end gap-x-4 whitespace-nowrap">
            <SearchContainer />
          </div> */}
        {/* </NavigationMenu> */}
      </div>
    </header>
  );
}
