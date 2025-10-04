"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import EmployeeEditor from "@/features/features/employee/components/forms/EmployeeEditor";
import { EmployeeFields } from "@/features/features/employee/data/EmployeeFields";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EmployeeService } from "@/features/features/employee/data/EmployeeService";
import "@/features/features/employee/hooks/useEmployeeTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export default function EmployeesList() {
  const t = useTranslations();

  const data: DataListRetriever<EmployeeInterface> = useDataListRetriever({
    module: Modules.Employee,
    retriever: (params) => EmployeeService.findMany(params),
    retrieverParams: {},
  });

  const functions: ReactNode[] = [<EmployeeEditor key="create-employee" />];

  return (
    <ContentListTable
      data={data}
      fields={[EmployeeFields.name, EmployeeFields.phone]}
      tableGeneratorType={Modules.Employee}
      functions={functions}
      title={t(`types.employees`, { count: 2 })}
    />
  );
}
