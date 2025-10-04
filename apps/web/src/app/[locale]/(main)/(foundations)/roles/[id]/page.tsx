import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import RoleContainer from "@/features/foundations/role/components/containers/RoleContainer";
import { RoleProvider } from "@/features/foundations/role/contexts/RoleContext";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { RoleService } from "@/features/foundations/role/data/RoleService";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function RolePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const role: RoleInterface = await RoleService.findById({
    roleId: params.id,
  });

  ServerSession.checkPermission({ module: Modules.Role, action: Action.Read, data: role });

  return (
    <RoleProvider dehydratedRole={role.dehydrate()}>
      <PageContainer>
        <RoleContainer />
      </PageContainer>
    </RoleProvider>
  );
}
