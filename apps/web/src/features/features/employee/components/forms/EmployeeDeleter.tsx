"use client";

import CommonDeleter from "@/features/common/components/forms/CommonDeleter";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EmployeeService } from "@/features/features/employee/data/EmployeeService";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type EmployeeDeleterProps = {
  employee: EmployeeInterface;
};

function EmployeeDeleterInternal({ employee }: EmployeeDeleterProps) {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  if (!employee) return null;

  return (
    <CommonDeleter
      title={t(`features.employee.delete.title`)}
      subtitle={t(`features.employee.delete.subtitle`)}
      description={t(`features.employee.delete.description`)}
      deleteFunction={() => EmployeeService.delete({ employeeId: employee.id })}
      redirectTo={generateUrl({ page: Modules.Employee })}
    />
  );
}

export default function EmployeeDeleter(props: EmployeeDeleterProps) {
  return withPermissions({
    Component: EmployeeDeleterInternal,
    modules: [Modules.Employee],
    action: Action.Delete,
    data: props.employee,
  })(props);
}
