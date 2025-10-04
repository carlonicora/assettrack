"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { PencilIcon } from "lucide-react";

import { useTranslations } from "next-intl";

type CommonEditorTriggerProps = { isEdit: boolean; edit?: string; create?: string };

export default function CommonEditorTrigger({ isEdit, edit, create }: CommonEditorTriggerProps) {
  const t = useTranslations();

  return (
    <DialogTrigger asChild>
      {isEdit ? (
        <Button size="sm" variant={`ghost`} className="text-muted-foreground">
          <PencilIcon />
        </Button>
      ) : (
        <Button size="sm" variant={`outline`}>
          {create ? create : t(`generic.buttons.create`)}
        </Button>
      )}
    </DialogTrigger>
  );
}
