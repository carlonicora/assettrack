"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { EquipmentFields } from "@/features/features/equipment/data/EquipmentFields";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { EquipmentService } from "@/features/features/equipment/data/EquipmentService";
import "@/features/features/equipment/hooks/useEquipmentTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";

export default function ExpiringEquipmentsList() {
  const t = useTranslations();

  const data: DataListRetriever<EquipmentInterface> = useDataListRetriever({
    module: Modules.Equipment,
    retriever: (params) => EquipmentService.findMany(params),
    retrieverParams: { expiring: true },
  });

  return (
    <ContentListTable
      data={data}
      fields={[
        EquipmentFields.name,
        EquipmentFields.supplier,
        EquipmentFields.employee,
        EquipmentFields.endDateOverdue,
      ]}
      tableGeneratorType={Modules.Equipment}
      title={t(`features.equipment.due_soon`)}
    />
  );
}
