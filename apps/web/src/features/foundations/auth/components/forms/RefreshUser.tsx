"use client";

import { updateToken } from "@/features/foundations/auth/utils/AuthCookies";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { UserService } from "@/features/foundations/user/data/UserService";
import { deleteCookie, getCookie } from "cookies-next";
import { useEffect } from "react";

export default function RefreshUser() {
  const { setUser } = useCurrentUserContext();

  const loadFullUser = async () => {
    const fullUser = await UserService.findFullUser();

    if (fullUser) {
      setUser(fullUser);
      const token = {
        userId: fullUser.id,
        companyId: fullUser.company?.id,
        licenseExpirationDate: fullUser.company?.licenseExpirationDate,
        roles: fullUser.roles.map((role) => role.id),
        features: fullUser.company?.features?.map((feature) => feature.id) ?? [],
        modules: fullUser.modules.map((module) => {
          return { id: module.id, permissions: module.permissions };
        }),
      };

      await updateToken(token);
      deleteCookie("reloadData");
    }
  };

  useEffect(() => {
    const reloadData = getCookie("reloadData");
    if (reloadData !== undefined) loadFullUser();
  }, []);

  return null;
}
