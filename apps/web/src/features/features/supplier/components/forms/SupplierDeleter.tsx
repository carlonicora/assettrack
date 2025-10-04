"use client";

import CommonDeleter from "@/features/common/components/forms/CommonDeleter";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { SupplierService } from "@/features/features/supplier/data/SupplierService";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type SupplierDeleterProps = {
  supplier: SupplierInterface;
};

function SupplierDeleterInternal({ supplier }: SupplierDeleterProps) {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  if (!supplier) return null;

  return (
    <CommonDeleter
      title={t(`features.supplier.delete.title`)}
      subtitle={t(`features.supplier.delete.subtitle`)}
      description={t(`features.supplier.delete.description`)}
      deleteFunction={() => SupplierService.delete({ supplierId: supplier.id })}
      redirectTo={generateUrl({ page: Modules.Supplier })}
    />
  );
}

export default function SupplierDeleter(props: SupplierDeleterProps) {
  return withPermissions({
    Component: SupplierDeleterInternal,
    modules: [Modules.Supplier],
    action: Action.Delete,
    data: props.supplier,
  })(props);
}
