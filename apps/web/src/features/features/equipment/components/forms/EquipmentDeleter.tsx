"use client";

import CommonDeleter from "@/features/common/components/forms/CommonDeleter";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { EquipmentService } from "@/features/features/equipment/data/EquipmentService";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type EquipmentDeleterProps = {
  equipment: EquipmentInterface;
};

function EquipmentDeleterInternal({ equipment }: EquipmentDeleterProps) {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  if (!equipment) return null;

  return (
    <CommonDeleter
      title={t(`features.equipment.delete.title`)}
      subtitle={t(`features.equipment.delete.subtitle`)}
      description={t(`features.equipment.delete.description`)}
      deleteFunction={() => EquipmentService.delete({ equipmentId: equipment.id })}
      redirectTo={generateUrl({ page: Modules.Equipment })}
    />
  );
}

export default function EquipmentDeleter(props: EquipmentDeleterProps) {
  return withPermissions({
    Component: EquipmentDeleterInternal,
    modules: [Modules.Equipment],
    action: Action.Delete,
    data: props.equipment,
  })(props);
}
