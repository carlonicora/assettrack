import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import LoanContainer from "@/features/features/loan/components/containers/LoanContainer";
import { LoanProvider } from "@/features/features/loan/contexts/LoanContext";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { LoanService } from "@/features/features/loan/data/LoanService";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const getCachedLoan = cache(async (id: string) => LoanService.findOne({ id }));

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations();

  const loan: LoanInterface = await getCachedLoan(params.id);

  const title = (await ServerSession.hasPermissionToModule({
    module: Modules.Loan,
    action: Action.Read,
    data: loan,
  }))
    ? `[${t(`types.loans`, { count: 1 })}] ${loan.name}`
    : `${t(`types.loans`, { count: 1 })}`;

  return await generateSpecificMetadata({ title: title });
}

export default async function LoanPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const loan: LoanInterface = await getCachedLoan(params.id);

  ServerSession.checkPermission({ module: Modules.Loan, action: Action.Read, data: loan });

  return (
    <LoanProvider dehydratedLoan={loan.dehydrate()}>
      <PageContainer>
        <LoanContainer />
      </PageContainer>
    </LoanProvider>
  );
}
