"use client";

import ExpiringEquipmentsList from "@/features/features/equipment/components/lists/ExpiringEquipmentsList";
import UnassignedEquipmentsList from "@/features/features/equipment/components/lists/UnassignedEquipmentsList";
import ActiveLoansList from "@/features/features/loan/components/lists/ActiveLoanList";

export default function IndexContainer() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ExpiringEquipmentsList />
      <UnassignedEquipmentsList />
      <ActiveLoansList />
      {/* <SuppliersList />
      <EmployeeListContainer />
      <EquipmentsList status={EquipmentStatus.Available} />
      <LoanListContainer /> */}
    </div>
  );
}
