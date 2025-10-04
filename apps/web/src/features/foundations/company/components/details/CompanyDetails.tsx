"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCompanyContext } from "@/features/foundations/company/contexts/CompanyContext";
import { useTranslations } from "next-intl";

export default function CompanyDetails() {
  const t = useTranslations();

  const { company } = useCompanyContext();
  if (!company) return null;

  return (
    <div className="flex w-full flex-col gap-y-4">
      <Card className="w-full">
        <CardContent className="p-4"></CardContent>
      </Card>
    </div>
  );
}
