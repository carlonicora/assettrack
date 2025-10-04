"use client";
import { Link } from "@/components/custom-ui/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import VersionDisplay from "@/features/common/components/navigations/VersionDisplay";
import NotificationModal from "@/features/foundations/notification/components/modals/NotificationModal";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import UserAvatar from "@/features/foundations/user/components/widgets/UserAvatar";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { ChevronsUpDown, LogOut, UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type UserSidebarFooterProps = {
  notificationModalOpen: boolean;
  setNotificationModalOpen: (open: boolean) => void;
};

export default function UserSidebarFooter({ notificationModalOpen, setNotificationModalOpen }: UserSidebarFooterProps) {
  const { currentUser } = useCurrentUserContext();
  const { isMobile } = useSidebar();
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const logOut = async () => {
    window.location.href = generateUrl({ page: `/logout` });
  };

  return (
    <SidebarMenu>
      {currentUser && !currentUser.roles?.find((role: RoleInterface) => role.id === AuthRole.Administrator) && (
        <SidebarMenuItem>
          <NotificationModal isOpen={notificationModalOpen} setIsOpen={setNotificationModalOpen} />
        </SidebarMenuItem>
      )}
      <SidebarMenuItem className="mt-2">
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <UserAvatar user={currentUser} className="h-5 w-5" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentUser.name}</span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{currentUser.name}</span>
                    <span className="truncate text-xs">{currentUser.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <VersionDisplay />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href={generateUrl({ page: Modules.User, id: currentUser.id })}>
                  <DropdownMenuItem>
                    <UserIcon />
                    {t(`generic.my_profile`)}
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut}>
                <LogOut />
                {t(`foundations.auth.buttons.logout`)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
