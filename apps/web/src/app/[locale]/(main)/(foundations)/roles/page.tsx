import PageContainer from "@/features/common/components/containers/PageContainer";
import RolesList from "@/features/foundations/role/components/lists/RolesList";
import { RoleProvider } from "@/features/foundations/role/contexts/RoleContext";

export default async function RolesListPage() {
  return (
    <RoleProvider>
      <PageContainer>
        <RolesList />
      </PageContainer>
    </RoleProvider>
  );
}
