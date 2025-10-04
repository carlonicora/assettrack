"use client";

import CompanyDetails from "@/features/foundations/company/components/details/CompanyDetails";
import CompanyUsersList from "@/features/foundations/user/components/lists/CompanyUsersList";

export default function CompanyContainer() {
  return (
    <div className="flex w-full flex-col gap-y-4">
      <CompanyDetails />
      <CompanyUsersList />
    </div>
  );
}
