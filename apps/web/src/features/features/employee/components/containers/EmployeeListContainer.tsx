"use client";

import EmployeeList from "@/features/features/employee/components/lists/EmployeeList";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";

import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";

function EmployeeListContainerInternal() {
  return <EmployeeList />;
}

export default function EmployeeListContainer() {
  const Response = withPermissions({
    Component: EmployeeListContainerInternal,
    modules: [Modules.Employee],
    action: Action.Read,
  });

  return <Response />;
}
