"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { EquipmentFields } from "@/features/features/equipment/data/EquipmentFields";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { EquipmentService } from "@/features/features/equipment/data/EquipmentService";
import "@/features/features/equipment/hooks/useEquipmentTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import EquipmentEditor from "@/features/features/equipment/components/forms/EquipmentEditor";

export default function EquipmentsList() {
  const t = useTranslations();

  const data: DataListRetriever<EquipmentInterface> = useDataListRetriever({
    module: Modules.Equipment,
    retriever: (params) => EquipmentService.findMany(params),
    retrieverParams: {},
  });

  const functions: ReactNode[] = [<EquipmentEditor key="create-equipment" />];

  return (
    <ContentListTable
      data={data}
      fields={[
        EquipmentFields.name,
        EquipmentFields.barcode,
        EquipmentFields.description,
        EquipmentFields.startDate,
        EquipmentFields.endDate,
        EquipmentFields.createdAt,
        EquipmentFields.updatedAt
      ]}
      tableGeneratorType={Modules.Equipment}
      functions={functions}
      title={t(`types.equipments`, { count: 2 })}
    />
  );
}
