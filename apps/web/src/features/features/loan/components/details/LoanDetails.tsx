"use client";

import { Link } from "@/components/custom-ui/link";
import AttributeElement from "@/features/common/components/lists/AttributeElement";
import ContentTitle from "@/features/common/components/navigations/ContentTitle";
import { useSharedContext } from "@/features/common/contexts/SharedContext";
import { useLoanContext } from "@/features/features/loan/contexts/LoanContext";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { formatDate } from "@/lib/date.formatter";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type LoanDetailsProps = {
  loan: LoanInterface;
};

function LoanDetailsInternal({ loan }: LoanDetailsProps) {
  const t = useTranslations();
  const { title } = useSharedContext();
  const generateUrl = usePageUrlGenerator();

  return (
    <div className="flex w-full flex-col gap-y-2">
      <ContentTitle type={title.type} element={title.element} functions={title.functions} />
      <AttributeElement
        title={t(`features.loan.relationships.equipment.label`)}
        value={
          <Link href={generateUrl({ page: Modules.Equipment, id: loan.equipment.id })}>{loan.equipment.name}</Link>
        }
      />
      <AttributeElement
        title={t(`features.loan.relationships.employee.label`)}
        value={<Link href={generateUrl({ page: Modules.Employee, id: loan.employee.id })}>{loan.employee.name}</Link>}
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
