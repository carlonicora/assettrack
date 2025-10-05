"use client";

import EquipmentList from "@/features/features/equipment/components/lists/EquipmentList";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

function EquipmentListContainerInternal() {
  return <EquipmentList />;
}

export default function EquipmentListContainer() {
  const Response = withPermissions({
    Component: EquipmentListContainerInternal,
    modules: [Modules.Equipment],
    action: Action.Read,
  });

  return <Response />;
}
