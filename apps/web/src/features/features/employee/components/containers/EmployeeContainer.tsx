"use client";

import EmployeeDetails from "@/features/features/employee/components/details/EmployeeDetails";
import { useEmployeeContext } from "@/features/features/employee/contexts/EmployeeContext";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import EmployeeLoansList from "@/features/features/loan/components/lists/EmployeeLoanList";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

type EmployeeContainerProps = {
  employee: EmployeeInterface;
};

function EmployeeContainerInternal({ employee }: EmployeeContainerProps) {
  return (
    <div className="flex w-full gap-x-4">
      <div className="w-2xl flex h-[calc(100vh-theme(spacing.20))] flex-col justify-between border-r pr-4">
        <div className="flex h-full overflow-y-auto">
          <EmployeeDetails />
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-4">
        <EmployeeLoansList employee={employee} />
      </div>
    </div>
  );
}

export default function EmployeeContainer() {
  const { employee } = useEmployeeContext();
  if (!employee) return null;

  return withPermissions({
    Component: EmployeeContainerInternal,
    modules: [Modules.Employee],
    action: Action.Read,
    data: employee,
  })({ employee: employee });
}
