import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import EquipmentListContainer from "@/features/features/equipment/components/containers/EquipmentListContainer";
import { EquipmentProvider } from "@/features/features/equipment/contexts/EquipmentContext";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";

export default async function EquipmentsListPage() {
  ServerSession.checkPermission({ module: Modules.Equipment, action: Action.Read });

  return (
    <EquipmentProvider>
      <PageContainer testId="page-equipments-container">
        <EquipmentListContainer />
      </PageContainer>
    </EquipmentProvider>
  );
}
