import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import LoanListContainer from "@/features/features/loan/components/containers/LoanListContainer";
import { LoanProvider } from "@/features/features/loan/contexts/LoanContext";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function LoansListPage() {
  ServerSession.checkPermission({ module: Modules.Loan, action: Action.Read });

  return (
    <LoanProvider>
      <PageContainer testId="page-loans-container">
        <LoanListContainer />
      </PageContainer>
    </LoanProvider>
  );
}
