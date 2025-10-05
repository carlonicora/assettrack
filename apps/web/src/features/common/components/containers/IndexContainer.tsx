"use client";

import AnalyticContainer from "@/features/features/analytic/components/containers/AnalyticContainer";
import { AnalyticInterface } from "@/features/features/analytic/data/AnalyticInterface";
import { AnalyticService } from "@/features/features/analytic/data/AnalyticService";
import ExpiringEquipmentsList from "@/features/features/equipment/components/lists/ExpiringEquipmentsList";
import UnassignedEquipmentsList from "@/features/features/equipment/components/lists/UnassignedEquipmentsList";
import ActiveLoansList from "@/features/features/loan/components/lists/ActiveLoanList";
import { useEffect, useState } from "react";

export default function IndexContainer() {
  const [analytic, setAnalytic] = useState<AnalyticInterface | null>(null);

  useEffect(() => {
    const fetchAnalytic = async () => {
      setAnalytic(await AnalyticService.find());
    };
    fetchAnalytic();
  }, []);

  return (
    <div className="flex w-full flex-col gap-y-4">
      {analytic && <AnalyticContainer analytic={analytic} />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ExpiringEquipmentsList />
        <UnassignedEquipmentsList />
        <ActiveLoansList />
        {/* <SuppliersList />
      <EmployeeListContainer />
      <EquipmentsList status={EquipmentStatus.Available} />
      <LoanListContainer /> */}
      </div>
    </div>
  );
}
