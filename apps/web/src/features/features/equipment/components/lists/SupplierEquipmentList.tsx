"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import EquipmentEditor from "@/features/features/equipment/components/forms/EquipmentEditor";
import { EquipmentFields } from "@/features/features/equipment/data/EquipmentFields";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { EquipmentService } from "@/features/features/equipment/data/EquipmentService";
import "@/features/features/equipment/hooks/useEquipmentTableStructure";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

type SupplierEquipmentsListProps = {
  supplier: SupplierInterface;
};

export default function SupplierEquipmentsList({ supplier }: SupplierEquipmentsListProps) {
  const t = useTranslations();

  const data: DataListRetriever<EquipmentInterface> = useDataListRetriever({
    module: Modules.Equipment,
    retriever: (params) => EquipmentService.findManyBySupplier(params),
    retrieverParams: { supplierId: supplier.id },
  });

  const functions: ReactNode[] = [<EquipmentEditor key="create-equipment" />];

  return (
    <ContentListTable
      data={data}
      fields={[EquipmentFields.name, EquipmentFields.startDate, EquipmentFields.endDate]}
      tableGeneratorType={Modules.Equipment}
      functions={functions}
      title={t(`types.equipments`, { count: 2 })}
    />
  );
}
