"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import CompanyDeleter from "@/features/foundations/company/components/forms/CompanyDeleter";
import CompanyEditor from "@/features/foundations/company/components/forms/CompanyEditor";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { Action } from "@/permisions/types";
import { useTranslations } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

interface CompanyContextType {
  company: CompanyInterface | undefined;
  setCompany: (value: CompanyInterface | undefined) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

type CompanyProviderProps = {
  children: ReactNode;
  dehydratedCompany?: JsonApiHydratedDataInterface;
};

const defaultContextValue: CompanyContextType = {
  company: undefined,
  setCompany: () => {},
};

export const CompanyProvider = ({ children, dehydratedCompany }: CompanyProviderProps) => {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();
  const { hasPermissionToModule, hasRole } = useCurrentUserContext();

  const [company, setCompany] = useState<CompanyInterface | undefined>(
    dehydratedCompany ? rehydrate<CompanyInterface>(Modules.Company, dehydratedCompany) : undefined,
  );

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    if (company)
      response.push({
        name: company.name,
        href: generateUrl({ page: Modules.Company }),
      });

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`types.companies`, { count: company ? 1 : 2 }),
    };

    if (company) response.element = company.name;

    const functions: ReactNode[] = [];

    if (
      company &&
      hasRole(AuthRole.Administrator) &&
      hasPermissionToModule({ module: Modules.Company, action: Action.Delete })
    )
      functions.push(<CompanyDeleter key="companyDeleter" company={company} />);

    if (hasRole(AuthRole.Administrator) || hasPermissionToModule({ module: Modules.Company, action: Action.Update }))
      functions.push(<CompanyEditor key="companyEditor" company={company} propagateChanges={setCompany} />);

    if (functions.length > 0) response.functions = functions;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <CompanyContext.Provider
        value={{
          company: company,
          setCompany: setCompany,
        }}
      >
        {children}
      </CompanyContext.Provider>
    </SharedProvider>
  );
};

export const useCompanyContext = (): CompanyContextType => {
  return useContext(CompanyContext) ?? defaultContextValue;
};
