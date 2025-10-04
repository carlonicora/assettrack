"use client";

import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { FeatureInterface } from "@/features/foundations/feature/data/FeatureInterface";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { checkPermissions } from "@/permisions/permissions.check";
import { Action, ModuleWithPermissions } from "@/permisions/types";
import { getCookie } from "cookies-next";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect } from "react";

interface CurrentUserContextType {
  currentUser: UserInterface | null;
  company: CompanyInterface | null;
  setUser: (user?: UserInterface) => void;
  hasPermissionToModule: <M extends ModuleWithPermissions>(params: {
    module: M;
    action: Action;
    data?: any;
  }) => boolean;
  hasPermissionToModules: <M extends ModuleWithPermissions>(params: {
    modules: M[];
    action: Action;
    data?: any;
  }) => boolean;
  hasPermissionToPath: (path: string) => boolean;
  hasAccesToFeature: (featureIdentifier: string) => boolean;
  matchUrlToModule: (prarms?: { path: string }) => ModuleWithPermissions | undefined;
  hasRole: (roleId: string) => boolean;
}

const userAtom = atomWithStorage("user", null);

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();

  const [dehydratedUser, setDehydratedUser] = useAtom(userAtom);

  useEffect(() => {
    const token = getCookie("token");
    if (!token && dehydratedUser) setDehydratedUser(null);
  }, [dehydratedUser, setDehydratedUser]);

  const matchUrlToModule = (params?: { path: string }): ModuleWithPermissions | undefined => {
    const moduleKeys = Object.getOwnPropertyNames(Modules).filter(
      (key) => key !== "prototype" && key !== "_factory" && key !== "length" && key !== "name",
    );

    const matchedModuleKey = moduleKeys.find((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(Modules, key);

      if (!descriptor?.get) return false;

      const selectedModule = descriptor.get.call(Modules);

      return path.toLowerCase().startsWith(selectedModule.pageUrl?.toLowerCase());
    });

    if (!matchedModuleKey) return undefined;

    const descriptor = Object.getOwnPropertyDescriptor(Modules, matchedModuleKey);
    return descriptor?.get?.call(Modules);
  };

  const currentUser = dehydratedUser ? rehydrate<UserInterface>(Modules.User, dehydratedUser) : null;

  const company = currentUser?.company ?? null;

  const setUser = (user?: UserInterface): void => {
    if (user) setDehydratedUser(user.dehydrate() as any);
    else setDehydratedUser(null);
  };

  const hasRole = (roleId: string): boolean => {
    if (!currentUser) return false;

    return !!currentUser.roles?.some((userRole: RoleInterface) => userRole.id === roleId);
  };

  const hasAccesToFeature = (featureIdentifier: string): boolean => {
    if (hasRole(AuthRole.Administrator)) return true;
    if (!company) return false;

    return company.features.some((feature: FeatureInterface) => feature.id === featureIdentifier);
  };

  function hasPermissionToModule<M extends ModuleWithPermissions>(params: {
    module: M;
    action: Action;
    data?: M extends ModuleWithPermissions ? any : never;
  }): boolean {
    if (!currentUser) return false;

    if (!!params.module.feature && !hasAccesToFeature(params.module.feature)) return false;

    return checkPermissions({ module: params.module, action: params.action, data: params.data, user: currentUser });
  }

  function hasPermissionToModules<M extends ModuleWithPermissions>(params: {
    modules: M[];
    action: Action;
    data?: M extends ModuleWithPermissions ? any : never;
  }): boolean {
    if (!currentUser) return false;

    if (!params.modules.every((module) => !module.feature || hasAccesToFeature(module.feature))) return false;

    return params.modules.every((module) =>
      checkPermissions({ module: module, action: params.action, data: params.data, user: currentUser }),
    );
  }

  function hasPermissionToPath(path: string): boolean {
    if (!currentUser) return false;
    if (path === "#" || path === "/") return true;

    const selectedModule = matchUrlToModule({ path: path });
    if (!selectedModule) return true;

    const response = hasPermissionToModule({ module: selectedModule, action: Action.Read });

    return response;
  }

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser: currentUser,
        company: company,
        setUser: setUser,
        hasPermissionToModule: hasPermissionToModule,
        hasPermissionToModules: hasPermissionToModules,
        hasPermissionToPath: hasPermissionToPath,
        hasAccesToFeature: hasAccesToFeature,
        matchUrlToModule: matchUrlToModule,
        hasRole: hasRole,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserContext = (): CurrentUserContextType => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error("useCurrentUserContext must be used within a UserProvider");
  }
  return context;
};
