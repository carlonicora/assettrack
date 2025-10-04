import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import EmployeeListContainer from "@/features/features/employee/components/containers/EmployeeListContainer";
import { EmployeeProvider } from "@/features/features/employee/contexts/EmployeeContext";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function EmployeesListPage() {
  ServerSession.checkPermission({ module: Modules.Employee, action: Action.Read });

  return (
    <EmployeeProvider>
      <PageContainer testId="page-employees-container">
        <EmployeeListContainer />
      </PageContainer>
    </EmployeeProvider>
  );
}
