import { ServerSession } from "@/contexts/ServerSession";
import IndexContainer from "@/features/common/components/containers/IndexContainer";
import PageContainer from "@/features/common/components/containers/PageContainer";
import { CommonProvider } from "@/features/common/contexts/CommonContext";
import AuthContainer from "@/features/foundations/auth/components/containers/AuthContainer";
import { AuthComponent } from "@/features/foundations/auth/enums/AuthComponent";
import CompaniesList from "@/features/foundations/company/components/lists/CompaniesList";
import { CompanyProvider } from "@/features/foundations/company/contexts/CompanyContext";
import { generateSpecificMetadata } from "@/lib/metadata";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return await generateSpecificMetadata({ title: t(`generic.home`) });
}

export default async function IndexPage() {
  if (!(await ServerSession.isLogged())) return <AuthContainer componentType={AuthComponent.Landing} />;

  if (await ServerSession.hasRole(AuthRole.Administrator)) {
    return (
      <CompanyProvider>
        <CommonProvider>
          <PageContainer>
            <CompaniesList />
          </PageContainer>
        </CommonProvider>
      </CompanyProvider>
    );
  }

  return (
    <CommonProvider>
      <PageContainer testId="page-homepage-container">
        <IndexContainer />
      </PageContainer>
    </CommonProvider>
  );
}
