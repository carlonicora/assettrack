"use client";

import AttributeElement from "@/features/common/components/lists/AttributeElement";
import ContentTitle from "@/features/common/components/navigations/ContentTitle";
import { useSupplierContext } from "@/features/features/supplier/contexts/SupplierContext";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { formatDate } from "@/lib/date.formatter";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";
import { useSharedContext } from "@/features/common/contexts/SharedContext";

type SupplierDetailsProps = {
  supplier: SupplierInterface;
};

function SupplierDetailsInternal({ supplier }: SupplierDetailsProps) {
  const t = useTranslations();
  const { title } = useSharedContext();

  return (
    <div className="flex w-full flex-col gap-y-2">
      <ContentTitle type={title.type} element={title.element} functions={title.functions} />
      <AttributeElement
        title={t(`features.supplier.fields.name.label`)}
        value={supplier.name}
      />
      <AttributeElement
        title={t(`features.supplier.fields.address.label`)}
        value={supplier.address}
      />
      <AttributeElement
        title={t(`features.supplier.fields.email.label`)}
        value={supplier.email}
      />
      <AttributeElement
        title={t(`features.supplier.fields.phone.label`)}
        value={supplier.phone}
      />
    </div>
  );
}

export default function SupplierDetails() {
  const { supplier } = useSupplierContext();
  if (!supplier) return null;

  return withPermissions({
    Component: SupplierDetailsInternal,
    modules: [Modules.Supplier],
    action: Action.Read,
    data: supplier,
  })({ supplier });
}
