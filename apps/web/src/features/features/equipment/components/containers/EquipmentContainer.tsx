"use client";

import EquipmentDetails from "@/features/features/equipment/components/details/EquipmentDetails";
import { useEquipmentContext } from "@/features/features/equipment/contexts/EquipmentContext";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

type EquipmentContainerProps = {
  equipment: EquipmentInterface;
};

function EquipmentContainerInternal({ equipment }: EquipmentContainerProps) {
  return (
    <div className="flex w-full gap-x-4">
      <div className="flex h-[calc(100vh-theme(spacing.20))] w-2xl flex-col justify-between border-r pr-4">
        <div className="flex h-full overflow-y-auto">
          <EquipmentDetails />
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-4">
      </div>
    </div>
  );
}

export default function EquipmentContainer() {
  const { equipment } = useEquipmentContext();
  if (!equipment) return null;

  return withPermissions({
    Component: EquipmentContainerInternal,
    modules: [Modules.Equipment],
    action: Action.Read,
    data: equipment,
  })({ equipment:equipment });
}
