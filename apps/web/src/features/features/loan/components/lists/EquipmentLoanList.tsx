"use client";

import { ContentListTable } from "@/features/common/components/tables/ContentListTable";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import LoanEditor from "@/features/features/loan/components/forms/LoanEditor";
import { LoanFields } from "@/features/features/loan/data/LoanFields";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { LoanService } from "@/features/features/loan/data/LoanService";
import "@/features/features/loan/hooks/useLoanTableStructure";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

type EquipmentLoansListProps = {
  equipment: EquipmentInterface;
};

export default function EquipmentLoansList({ equipment }: EquipmentLoansListProps) {
  const t = useTranslations();

  const data: DataListRetriever<LoanInterface> = useDataListRetriever({
    module: Modules.Loan,
    retriever: (params) => LoanService.findManyByEquipment(params),
    retrieverParams: { equipmentId: equipment.id },
  });

  const functions: ReactNode[] = [equipment.currentLoan ? null : <LoanEditor key="create-loan" />];

  return (
    <ContentListTable
      data={data}
      fields={[LoanFields.employee, LoanFields.startDate]}
      tableGeneratorType={Modules.Loan}
      functions={functions}
      title={t(`types.loans`, { count: 2 })}
    />
  );
}
