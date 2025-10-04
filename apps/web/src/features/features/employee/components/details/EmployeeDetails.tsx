"use client";

import AttributeElement from "@/features/common/components/lists/AttributeElement";
import ContentTitle from "@/features/common/components/navigations/ContentTitle";
import { useEmployeeContext } from "@/features/features/employee/contexts/EmployeeContext";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { formatDate } from "@/lib/date.formatter";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";
import { useSharedContext } from "@/features/common/contexts/SharedContext";

type EmployeeDetailsProps = {
  employee: EmployeeInterface;
};

function EmployeeDetailsInternal({ employee }: EmployeeDetailsProps) {
  const t = useTranslations();
  const { title } = useSharedContext();

  return (
    <div className="flex w-full flex-col gap-y-2">
      <ContentTitle type={title.type} element={title.element} functions={title.functions} />
      <AttributeElement
        title={t(`features.employee.fields.name.label`)}
        value={employee.name}
      />
      <AttributeElement
        title={t(`features.employee.fields.phone.label`)}
        value={employee.phone}
      />
      <AttributeElement
        title={t(`features.employee.fields.email.label`)}
        value={employee.email}
      />
      <AttributeElement
        title={t(`features.employee.fields.avatar.label`)}
        value={employee.avatar}
      />
    </div>
  );
}

export default function EmployeeDetails() {
  const { employee } = useEmployeeContext();
  if (!employee) return null;

  return withPermissions({
    Component: EmployeeDetailsInternal,
    modules: [Modules.Employee],
    action: Action.Read,
    data: employee,
  })({ employee });
}
