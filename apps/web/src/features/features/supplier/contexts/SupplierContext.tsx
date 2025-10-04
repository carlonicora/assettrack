"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import SupplierDeleter from "@/features/features/supplier/components/forms/SupplierDeleter";
import SupplierEditor from "@/features/features/supplier/components/forms/SupplierEditor";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

interface SupplierContextType {
  supplier: SupplierInterface | undefined;
  setSupplier: (value: SupplierInterface | undefined) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

type SupplierProviderProps = {
  children: ReactNode;
  dehydratedSupplier?: JsonApiHydratedDataInterface;
};

export const SupplierProvider = ({ children, dehydratedSupplier }: SupplierProviderProps) => {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const [supplier, setSupplier] = useState<SupplierInterface | undefined>(
    dehydratedSupplier ? rehydrate<SupplierInterface>(Modules.Supplier, dehydratedSupplier) : undefined,
  );

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    response.push({
      name: t(`types.suppliers`, { count: 2 }),
      href: generateUrl({ page: Modules.Supplier }),
    });

    if (supplier)
      response.push({
        name: supplier.name,
        href: generateUrl({ page: Modules.Supplier, id: supplier.id }),
      });

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`types.suppliers`, { count: supplier ? 1 : 2 }),
    };

    const functions: ReactNode[] = [];

    if (supplier) {
      response.element = supplier.name;

      functions.push(<SupplierDeleter key={`SupplierDeleter`} supplier={supplier} />);

      functions.push(<SupplierEditor key={`SupplierEditor`} supplier={supplier} propagateChanges={setSupplier} />);
    } else {
      functions.push(<SupplierEditor key={`SupplierEditor`} />);
    }

    if (functions.length > 0) response.functions = functions;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <SupplierContext.Provider
        value={{
          supplier: supplier,
          setSupplier: setSupplier,
        }}
      >
        {children}
      </SupplierContext.Provider>
    </SharedProvider>
  );
};

export const useSupplierContext = (): SupplierContextType => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error("useSupplierContext must be used within a SupplierProvider");
  }
  return context;
};
