import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import AdminCompanyContainer from "@/features/foundations/company/components/containers/AdminCompanyContainer";
import { CompanyProvider } from "@/features/foundations/company/contexts/CompanyContext";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { CompanyService } from "@/features/foundations/company/data/CompanyService";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { Action } from "@/permisions/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const getCachedCompany = cache(async (id: string) => CompanyService.findOne({ companyId: id }));

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations();

  const company: CompanyInterface = await getCachedCompany(params.id);

  const title = (await ServerSession.hasPermissionToModule({
    module: Modules.Company,
    action: Action.Read,
    data: company,
  }))
    ? `[${t(`types.companies`, { count: 1 })}] ${company.name}`
    : `${t(`types.companies`, { count: 1 })}`;

  return await generateSpecificMetadata({ title: title });
}

export default async function CompanyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const company: CompanyInterface = await getCachedCompany(params.id);

  if (!(await ServerSession.hasRole(AuthRole.Administrator)))
    ServerSession.checkPermission({ module: Modules.Company, action: Action.Read, data: company });

  return (
    <CompanyProvider dehydratedCompany={company.dehydrate()}>
      <PageContainer>
        <AdminCompanyContainer />
      </PageContainer>
    </CompanyProvider>
  );
}
