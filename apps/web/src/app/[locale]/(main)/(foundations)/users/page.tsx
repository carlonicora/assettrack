import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import UsersListContainer from "@/features/foundations/user/components/containers/UsersListContainer";
import { UserProvider } from "@/features/foundations/user/contexts/UserContext";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function UsersListPage() {
  ServerSession.checkPermission({ module: Modules.User, action: Action.Read });

  return (
    <UserProvider>
      <PageContainer testId="page-users-container">
        <UsersListContainer />
      </PageContainer>
    </UserProvider>
  );
}
