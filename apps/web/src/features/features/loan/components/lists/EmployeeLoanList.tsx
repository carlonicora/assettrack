"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import LoanEditor from "@/features/features/loan/components/forms/LoanEditor";
import { LoanFields } from "@/features/features/loan/data/LoanFields";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { LoanService } from "@/features/features/loan/data/LoanService";
import "@/features/features/loan/hooks/useLoanTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

type EmployeeLoansListProps = {
  employee: EmployeeInterface;
};

export default function EmployeeLoansList({ employee }: EmployeeLoansListProps) {
  const t = useTranslations();

  const data: DataListRetriever<LoanInterface> = useDataListRetriever({
    module: Modules.Loan,
    retriever: (params) => LoanService.findManyByEmployee(params),
    retrieverParams: { employeeId: employee.id },
  });

  const functions: ReactNode[] = [<LoanEditor key="create-loan" />];

  return (
    <ContentListTable
      data={data}
      fields={[LoanFields.equipment, LoanFields.startDate]}
      tableGeneratorType={Modules.Loan}
      functions={functions}
      title={t(`types.loans`, { count: 2 })}
    />
  );
}
