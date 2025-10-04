"use client";

import LoanList from "@/features/features/loan/components/lists/LoanList";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

function LoanListContainerInternal() {
  return <LoanList />;
}

export default function LoanListContainer() {
  const Response = withPermissions({
    Component: LoanListContainerInternal,
    modules: [Modules.Loan],
    action: Action.Read,
  });

  return <Response />;
}
