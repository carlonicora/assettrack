"use client";

import AttributeElement from "@/features/common/components/lists/AttributeElement";
import ContentTitle from "@/features/common/components/navigations/ContentTitle";
import { useEquipmentContext } from "@/features/features/equipment/contexts/EquipmentContext";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { formatDate } from "@/lib/date.formatter";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";
import { useSharedContext } from "@/features/common/contexts/SharedContext";

type EquipmentDetailsProps = {
  equipment: EquipmentInterface;
};

function EquipmentDetailsInternal({ equipment }: EquipmentDetailsProps) {
  const t = useTranslations();
  const { title } = useSharedContext();

  return (
    <div className="flex w-full flex-col gap-y-2">
      <ContentTitle type={title.type} element={title.element} functions={title.functions} />
      <AttributeElement
        title={t(`features.equipment.fields.name.label`)}
        value={equipment.name}
      />
      <AttributeElement
        title={t(`features.equipment.fields.barcode.label`)}
        value={equipment.barcode}
      />
      <AttributeElement
        title={t(`features.equipment.fields.description.label`)}
        value={equipment.description}
      />
      <AttributeElement
        title={t(`features.equipment.fields.startDate.label`)}
        value={equipment.startDate ? formatDate(equipment.startDate, "date") : undefined}
      />
      <AttributeElement
        title={t(`features.equipment.fields.endDate.label`)}
        value={equipment.endDate ? formatDate(equipment.endDate, "date") : undefined}
      />
    </div>
  );
}

export default function EquipmentDetails() {
  const { equipment } = useEquipmentContext();
  if (!equipment) return null;

  return withPermissions({
    Component: EquipmentDetailsInternal,
    modules: [Modules.Equipment],
    action: Action.Read,
    data: equipment,
  })({ equipment });
}
