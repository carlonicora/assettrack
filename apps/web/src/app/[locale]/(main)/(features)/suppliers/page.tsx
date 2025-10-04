import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import SupplierListContainer from "@/features/features/supplier/components/containers/SupplierListContainer";
import { SupplierProvider } from "@/features/features/supplier/contexts/SupplierContext";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function SuppliersListPage() {
  ServerSession.checkPermission({ module: Modules.Supplier, action: Action.Read });

  return (
    <SupplierProvider>
      <PageContainer testId="page-suppliers-container">
        <SupplierListContainer />
      </PageContainer>
    </SupplierProvider>
  );
}
