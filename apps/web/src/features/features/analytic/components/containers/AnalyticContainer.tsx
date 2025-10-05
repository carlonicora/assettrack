"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnalyticInterface } from "@/features/features/analytic/data/AnalyticInterface";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";

type AnalyticContainerProps = {
  analytic: AnalyticInterface;
};

function AnalyticCard({ title, value, className }: { title: string; value: number; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="flex w-full flex-col gap-y-1 p-4">
        <div className="w-full text-center text-4xl">{value}</div>
        <div className="text-muted-foreground w-full text-center text-sm">{title}</div>
      </CardContent>
    </Card>
  );
}

function AnalyticContainerInternal({ analytic }: AnalyticContainerProps) {
  const t = useTranslations();

  return (
    <div className="grid w-full grid-cols-3 gap-4 lg:grid-cols-6">
      <AnalyticCard title={t("features.analytic.fields.equipment.label")} value={analytic.equipment} />
      <AnalyticCard title={t("features.analytic.fields.loan.label")} value={analytic.loan} />
      <AnalyticCard title={t("features.analytic.fields.expiring30.label")} value={analytic.expiring30} />
      <AnalyticCard title={t("features.analytic.fields.expiring60.label")} value={analytic.expiring60} />
      <AnalyticCard title={t("features.analytic.fields.expiring90.label")} value={analytic.expiring90} />
      <AnalyticCard
        title={t("features.analytic.fields.expired.label")}
        value={analytic.expired}
        className={analytic.expired > 0 ? `text-destructive` : `text-muted-foreground`}
      />
    </div>
  );
}

export default function AnalyticContainer({ analytic }: AnalyticContainerProps) {
  return withPermissions({
    Component: AnalyticContainerInternal,
    modules: [Modules.Analytic],
    action: Action.Read,
    data: analytic,
  })({ analytic: analytic });
}
