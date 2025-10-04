import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import EquipmentContainer from "@/features/features/equipment/components/containers/EquipmentContainer";
import { EquipmentProvider } from "@/features/features/equipment/contexts/EquipmentContext";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { EquipmentService } from "@/features/features/equipment/data/EquipmentService";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const getCachedEquipment = cache(async (id: string) => EquipmentService.findOne({ id }));

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations();

  const equipment: EquipmentInterface = await getCachedEquipment(params.id);

  const title = (await ServerSession.hasPermissionToModule({
    module: Modules.Equipment,
    action: Action.Read,
    data: equipment,
  }))
    ? `[${t(`types.equipments`, { count: 1 })}] ${equipment.name}`
    : `${t(`types.equipments`, { count: 1 })}`;

  return await generateSpecificMetadata({ title: title });
}

export default async function EquipmentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const equipment: EquipmentInterface = await getCachedEquipment(params.id);

  ServerSession.checkPermission({ module: Modules.Equipment, action: Action.Read, data: equipment });

  return (
    <EquipmentProvider dehydratedEquipment={equipment.dehydrate()}>
      <PageContainer>
        <EquipmentContainer />
      </PageContainer>
    </EquipmentProvider>
  );
}
