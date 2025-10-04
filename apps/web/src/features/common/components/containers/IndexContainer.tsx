"use client";

import EmployeeListContainer from "@/features/features/employee/components/containers/EmployeeListContainer";
import EquipmentListContainer from "@/features/features/equipment/components/containers/EquipmentListContainer";
import LoanListContainer from "@/features/features/loan/components/containers/LoanListContainer";
import SuppliersList from "@/features/features/supplier/components/lists/SupplierList";

export default function IndexContainer() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SuppliersList />
      <EmployeeListContainer />
      <EquipmentListContainer />
      <LoanListContainer />
    </div>
  );
}
