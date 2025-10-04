"use client";

import CommonDeleter from "@/features/common/components/forms/CommonDeleter";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { LoanService } from "@/features/features/loan/data/LoanService";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type LoanDeleterProps = {
  loan: LoanInterface;
};

function LoanDeleterInternal({ loan }: LoanDeleterProps) {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  if (!loan) return null;

  return (
    <CommonDeleter
      title={t(`features.loan.delete.title`)}
      subtitle={t(`features.loan.delete.subtitle`)}
      description={t(`features.loan.delete.description`)}
      deleteFunction={() => LoanService.delete({ loanId: loan.id })}
      redirectTo={generateUrl({ page: Modules.Loan })}
    />
  );
}

export default function LoanDeleter(props: LoanDeleterProps) {
  return withPermissions({
    Component: LoanDeleterInternal,
    modules: [Modules.Loan],
    action: Action.Delete,
    data: props.loan,
  })(props);
}
