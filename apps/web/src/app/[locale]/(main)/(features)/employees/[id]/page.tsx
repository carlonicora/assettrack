import { ServerSession } from "@/contexts/ServerSession";
import PageContainer from "@/features/common/components/containers/PageContainer";
import EmployeeContainer from "@/features/features/employee/components/containers/EmployeeContainer";
import { EmployeeProvider } from "@/features/features/employee/contexts/EmployeeContext";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EmployeeService } from "@/features/features/employee/data/EmployeeService";
import { generateSpecificMetadata } from "@/lib/metadata";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const getCachedEmployee = cache(async (id: string) => EmployeeService.findOne({ id }));

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations();

  const employee: EmployeeInterface = await getCachedEmployee(params.id);

  const title = (await ServerSession.hasPermissionToModule({
    module: Modules.Employee,
    action: Action.Read,
    data: employee,
  }))
    ? `[${t(`types.employees`, { count: 1 })}] ${employee.name}`
    : `${t(`types.employees`, { count: 1 })}`;

  return await generateSpecificMetadata({ title: title });
}

export default async function EmployeePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const employee: EmployeeInterface = await getCachedEmployee(params.id);

  ServerSession.checkPermission({ module: Modules.Employee, action: Action.Read, data: employee });

  return (
    <EmployeeProvider dehydratedEmployee={employee.dehydrate()}>
      <PageContainer>
        <EmployeeContainer />
      </PageContainer>
    </EmployeeProvider>
  );
}
