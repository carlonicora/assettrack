"use client";

import { Card, CardContent } from "@/components/ui/card";
import AttributeElement from "@/features/common/components/lists/AttributeElement";
import { useRoleContext } from "@/features/foundations/role/contexts/RoleContext";
import { useTranslations } from "next-intl";

export default function RoleDetails() {
  const { role } = useRoleContext();
  const t = useTranslations();

  if (!role) return null;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <AttributeElement title={t(`foundations.role.fields.description.label`)} value={role.description} />
      </CardContent>
    </Card>
  );
}
