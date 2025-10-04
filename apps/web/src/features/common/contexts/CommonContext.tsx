"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { useTranslations } from "next-intl";

import { createContext, ReactNode, useContext } from "react";

interface CommonContextType {}

const CommonContext = createContext<CommonContextType | undefined>(undefined);

type CommonProviderProps = {
  children: ReactNode;
};

export const CommonProvider = ({ children }: CommonProviderProps) => {
  const { company } = useCurrentUserContext();
  const t = useTranslations();

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`generic.title`),
    };

    if (company) response.element = company.name;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <CommonContext.Provider value={{}}>{children}</CommonContext.Provider>
    </SharedProvider>
  );
};

export const useCommonContext = (): CommonContextType => {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error("useCommonContext must be used within a CommonProvider");
  }
  return context;
};
