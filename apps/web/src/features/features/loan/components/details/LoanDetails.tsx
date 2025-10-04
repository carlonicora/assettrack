"use client";

import AttributeElement from "@/features/common/components/lists/AttributeElement";
import ContentTitle from "@/features/common/components/navigations/ContentTitle";
import { useLoanContext } from "@/features/features/loan/contexts/LoanContext";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { formatDate } from "@/lib/date.formatter";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";
import { useSharedContext } from "@/features/common/contexts/SharedContext";

type LoanDetailsProps = {
  loan: LoanInterface;
};

function LoanDetailsInternal({ loan }: LoanDetailsProps) {
  const t = useTranslations();
  const { title } = useSharedContext();

  return (
    <div className="flex w-full flex-col gap-y-2">
      <ContentTitle type={title.type} element={title.element} functions={title.functions} />
      <AttributeElement
        title={t(`features.loan.fields.name.label`)}
        value={loan.name}
      />
      <AttributeElement
        title={t(`features.loan.fields.startDate.label`)}
        value={loan.startDate ? formatDate(loan.startDate, "date") : undefined}
      />
      <AttributeElement
        title={t(`features.loan.fields.endDate.label`)}
        value={loan.endDate ? formatDate(loan.endDate, "date") : undefined}
      />
    </div>
  );
}

export default function LoanDetails() {
  const { loan } = useLoanContext();
  if (!loan) return null;

  return withPermissions({
    Component: LoanDetailsInternal,
    modules: [Modules.Loan],
    action: Action.Read,
    data: loan,
  })({ loan });
}
