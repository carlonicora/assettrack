"use client";

import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useTranslations } from "next-intl";

type CommonEditorHeaderProps = {
  type: string;
  name?: string;
};

export default function CommonEditorHeader({ type, name }: CommonEditorHeaderProps) {
  const t = useTranslations();

  return (
    <DialogHeader>
      <DialogTitle>
        {name
          ? t(`generic.edit.update.title`, {
              type: type,
            })
          : t(`generic.edit.create.title`, { type: type })}
      </DialogTitle>
      <DialogDescription>
        {name
          ? t(`generic.edit.update.description`, {
              type: type,
              name: name,
            })
          : t(`generic.edit.create.description`, {
              type: type,
            })}
      </DialogDescription>
    </DialogHeader>
  );
}
