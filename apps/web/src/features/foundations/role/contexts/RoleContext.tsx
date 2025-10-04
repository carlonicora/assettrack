"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

interface RoleContextType {
  role: RoleInterface | undefined;
  setRole: (value: RoleInterface | undefined) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

type RoleProviderProps = {
  children: ReactNode;
  dehydratedRole?: JsonApiHydratedDataInterface;
};

export const RoleProvider = ({ children, dehydratedRole }: RoleProviderProps) => {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const [role, setRole] = useState<RoleInterface | undefined>(
    dehydratedRole ? rehydrate<RoleInterface>(Modules.Role, dehydratedRole) : undefined,
  );

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    response.push({
      name: t(`types.roles`, { count: 2 }),
      href: generateUrl({ page: Modules.Role }),
    });

    if (role)
      response.push({
        name: role.name,
        href: generateUrl({ page: Modules.Role, id: role.id }),
      });

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`types.roles`, { count: role ? 1 : 2 }),
    };

    const functions: ReactNode[] = [];

    if (role) {
      response.element = role.name;
    }

    if (functions.length > 0) response.functions = functions;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <RoleContext.Provider
        value={{
          role: role,
          setRole: setRole,
        }}
      >
        {children}
      </RoleContext.Provider>
    </SharedProvider>
  );
};

export const useRoleContext = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return context;
};
