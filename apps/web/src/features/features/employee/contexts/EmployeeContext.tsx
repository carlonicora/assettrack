"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import EmployeeDeleter from "@/features/features/employee/components/forms/EmployeeDeleter";
import EmployeeEditor from "@/features/features/employee/components/forms/EmployeeEditor";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

interface EmployeeContextType {
  employee: EmployeeInterface | undefined;
  setEmployee: (value: EmployeeInterface | undefined) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

type EmployeeProviderProps = {
  children: ReactNode;
  dehydratedEmployee?: JsonApiHydratedDataInterface;
};

export const EmployeeProvider = ({ children, dehydratedEmployee }: EmployeeProviderProps) => {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const [employee, setEmployee] = useState<EmployeeInterface | undefined>(
    dehydratedEmployee ? rehydrate<EmployeeInterface>(Modules.Employee, dehydratedEmployee) : undefined,
  );

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    response.push({
      name: t(`types.employees`, { count: 2 }),
      href: generateUrl({ page: Modules.Employee }),
    });

    if (employee)
      response.push({
        name: employee.name,
        href: generateUrl({ page: Modules.Employee, id: employee.id }),
      });

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`types.employees`, { count: employee ? 1 : 2 }),
    };

    const functions: ReactNode[] = [];

    if (employee) {
      response.element = employee.name;

      functions.push(<EmployeeDeleter key={`EmployeeDeleter`} employee={employee} />);

      functions.push(<EmployeeEditor key={`EmployeeEditor`} employee={employee} propagateChanges={setEmployee} />);
    } else {
      functions.push(<EmployeeEditor key={`EmployeeEditor`} />);
    }

    if (functions.length > 0) response.functions = functions;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <EmployeeContext.Provider
        value={{
          employee: employee,
          setEmployee: setEmployee,
        }}
      >
        {children}
      </EmployeeContext.Provider>
    </SharedProvider>
  );
};

export const useEmployeeContext = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployeeContext must be used within a EmployeeProvider");
  }
  return context;
};
