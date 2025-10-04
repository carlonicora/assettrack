"use client";

import LoanDetails from "@/features/features/loan/components/details/LoanDetails";
import { useLoanContext } from "@/features/features/loan/contexts/LoanContext";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

type LoanContainerProps = {
  loan: LoanInterface;
};

function LoanContainerInternal({ loan }: LoanContainerProps) {
  return (
    <div className="flex w-full gap-x-4">
      <div className="flex h-[calc(100vh-theme(spacing.20))] w-2xl flex-col justify-between border-r pr-4">
        <div className="flex h-full overflow-y-auto">
          <LoanDetails />
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-4">
      </div>
    </div>
  );
}

export default function LoanContainer() {
  const { loan } = useLoanContext();
  if (!loan) return null;

  return withPermissions({
    Component: LoanContainerInternal,
    modules: [Modules.Loan],
    action: Action.Read,
    data: loan,
  })({ loan:loan });
}
