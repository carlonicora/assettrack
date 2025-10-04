import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import CompanyContainer from "@/features/foundations/company/components/containers/CompanyContainer";
import { CompanyProvider } from "@/features/foundations/company/contexts/CompanyContext";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { CompanyService } from "@/features/foundations/company/data/CompanyService";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function CompaniesPage() {
  const company: CompanyInterface = await CompanyService.findOne({ companyId: await ServerSession.companyId() });

  ServerSession.checkPermission({ module: Modules.Company, action: Action.Read, data: company });

  return (
    <CompanyProvider dehydratedCompany={company.dehydrate()}>
      <PageContainer testId="page-companies-container">
        <CompanyContainer />
      </PageContainer>
    </CompanyProvider>
  );
}
