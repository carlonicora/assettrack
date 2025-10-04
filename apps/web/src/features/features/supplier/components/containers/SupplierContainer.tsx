"use client";

import SupplierEquipmentsList from "@/features/features/equipment/components/lists/SupplierEquipmentList";
import SupplierDetails from "@/features/features/supplier/components/details/SupplierDetails";
import { useSupplierContext } from "@/features/features/supplier/contexts/SupplierContext";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

type SupplierContainerProps = {
  supplier: SupplierInterface;
};

function SupplierContainerInternal({ supplier }: SupplierContainerProps) {
  return (
    <div className="flex w-full gap-x-4">
      <div className="w-2xl flex h-[calc(100vh-theme(spacing.20))] flex-col justify-between border-r pr-4">
        <div className="flex h-full overflow-y-auto">
          <SupplierDetails />
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-4">
        <SupplierEquipmentsList supplier={supplier} />
      </div>
    </div>
  );
}

export default function SupplierContainer() {
  const { supplier } = useSupplierContext();
  if (!supplier) return null;

  return withPermissions({
    Component: SupplierContainerInternal,
    modules: [Modules.Supplier],
    action: Action.Read,
    data: supplier,
  })({ supplier: supplier });
}
