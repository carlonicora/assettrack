import PageContainer from "@/features/common/components/containers/PageContainer";
import CompaniesList from "@/features/foundations/company/components/lists/CompaniesList";
import { CompanyProvider } from "@/features/foundations/company/contexts/CompanyContext";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return await generateSpecificMetadata({
    title: t(`types.companies`, { count: 2 }),
  });
}

export default async function CompaniesListPage() {
  return (
    <CompanyProvider>
      <PageContainer>
        <CompaniesList />
      </PageContainer>
    </CompanyProvider>
  );
}
