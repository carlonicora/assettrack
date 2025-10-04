"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import SupplierEditor from "@/features/features/supplier/components/forms/SupplierEditor";
import { SupplierFields } from "@/features/features/supplier/data/SupplierFields";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { SupplierService } from "@/features/features/supplier/data/SupplierService";
import "@/features/features/supplier/hooks/useSupplierTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export default function SuppliersList() {
  const t = useTranslations();

  const data: DataListRetriever<SupplierInterface> = useDataListRetriever({
    module: Modules.Supplier,
    retriever: (params) => SupplierService.findMany(params),
    retrieverParams: {},
  });

  const functions: ReactNode[] = [<SupplierEditor key="create-supplier" />];

  return (
    <ContentListTable
      data={data}
      fields={[SupplierFields.name]}
      tableGeneratorType={Modules.Supplier}
      functions={functions}
      title={t(`types.suppliers`, { count: 2 })}
    />
  );
}
