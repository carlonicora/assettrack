"use client";

import SupplierList from "@/features/features/supplier/components/lists/SupplierList";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

function SupplierListContainerInternal() {
  return <SupplierList />;
}

export default function SupplierListContainer() {
  const Response = withPermissions({
    Component: SupplierListContainerInternal,
    modules: [Modules.Supplier],
    action: Action.Read,
  });

  return <Response />;
}
