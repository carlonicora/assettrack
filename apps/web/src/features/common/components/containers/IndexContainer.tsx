"use client";

import EmployeeListContainer from "@/features/features/employee/components/containers/EmployeeListContainer";
import EquipmentsList from "@/features/features/equipment/components/lists/EquipmentList";
import LoanListContainer from "@/features/features/loan/components/containers/LoanListContainer";
import SuppliersList from "@/features/features/supplier/components/lists/SupplierList";
import { EquipmentStatus } from "@assettrack/shared";

export default function IndexContainer() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SuppliersList />
      <EmployeeListContainer />
      <EquipmentsList status={EquipmentStatus.Available} />
      <LoanListContainer />
    </div>
  );
}
