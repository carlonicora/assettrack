import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import SupplierContainer from "@/features/features/supplier/components/containers/SupplierContainer";
import { SupplierProvider } from "@/features/features/supplier/contexts/SupplierContext";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { SupplierService } from "@/features/features/supplier/data/SupplierService";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const getCachedSupplier = cache(async (id: string) => SupplierService.findOne({ id }));

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations();

  const supplier: SupplierInterface = await getCachedSupplier(params.id);

  const title = (await ServerSession.hasPermissionToModule({
    module: Modules.Supplier,
    action: Action.Read,
    data: supplier,
  }))
    ? `[${t(`types.suppliers`, { count: 1 })}] ${supplier.name}`
    : `${t(`types.suppliers`, { count: 1 })}`;

  return await generateSpecificMetadata({ title: title });
}

export default async function SupplierPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supplier: SupplierInterface = await getCachedSupplier(params.id);

  ServerSession.checkPermission({ module: Modules.Supplier, action: Action.Read, data: supplier });

  return (
    <SupplierProvider dehydratedSupplier={supplier.dehydrate()}>
      <PageContainer>
        <SupplierContainer />
      </PageContainer>
    </SupplierProvider>
  );
}
