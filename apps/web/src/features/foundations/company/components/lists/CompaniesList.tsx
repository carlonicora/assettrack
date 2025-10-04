"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import CompanyEditor from "@/features/foundations/company/components/forms/CompanyEditor";
import { CompanyFields } from "@/features/foundations/company/data/CompanyFields";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { CompanyService } from "@/features/foundations/company/data/CompanyService";
import "@/features/foundations/company/hooks/useCompanyTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export default function CompaniesList() {
  const t = useTranslations();

  const data: DataListRetriever<CompanyInterface> = useDataListRetriever({
    retriever: (params) => CompanyService.findMany(params),
    retrieverParams: {},
    module: Modules.Company,
  });

  const functions: ReactNode[] = [<CompanyEditor key="create-account" />];

  return (
    <ContentListTable
      data={data}
      fields={[CompanyFields.name, CompanyFields.createdAt]}
      tableGeneratorType={Modules.Company}
      functions={functions}
      title={t(`types.companies`, { count: 2 })}
    />
  );
}
