"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import EquipmentDeleter from "@/features/features/equipment/components/forms/EquipmentDeleter";
import EquipmentEditor from "@/features/features/equipment/components/forms/EquipmentEditor";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

interface EquipmentContextType {
  equipment: EquipmentInterface | undefined;
  setEquipment: (value: EquipmentInterface | undefined) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

type EquipmentProviderProps = {
  children: ReactNode;
  dehydratedEquipment?: JsonApiHydratedDataInterface;
};

export const EquipmentProvider = ({ children, dehydratedEquipment }: EquipmentProviderProps) => {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const [equipment, setEquipment] = useState<EquipmentInterface | undefined>(
    dehydratedEquipment ? rehydrate<EquipmentInterface>(Modules.Equipment, dehydratedEquipment) : undefined,
  );

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    response.push({
      name: t(`types.equipments`, { count: 2 }),
      href: generateUrl({ page: Modules.Equipment }),
    });

    if (equipment)
      response.push({
        name: equipment.name,
        href: generateUrl({ page: Modules.Equipment, id: equipment.id }),
      });

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`types.equipments`, { count: equipment ? 1 : 2 }),
    };

    const functions: ReactNode[] = [];

    if (equipment) {
      response.element = equipment.name;

      functions.push(<EquipmentDeleter key={`EquipmentDeleter`} equipment={equipment} />);

      functions.push(<EquipmentEditor key={`EquipmentEditor`} equipment={equipment} propagateChanges={setEquipment} />);
    } else {
      functions.push(<EquipmentEditor key={`EquipmentEditor`} />);
    }

    if (functions.length > 0) response.functions = functions;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <EquipmentContext.Provider
        value={{
          equipment: equipment,
          setEquipment: setEquipment,
        }}
      >
        {children}
      </EquipmentContext.Provider>
    </SharedProvider>
  );
};

export const useEquipmentContext = (): EquipmentContextType => {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error("useEquipmentContext must be used within a EquipmentProvider");
  }
  return context;
};
