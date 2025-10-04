"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { errorToast } from "@/features/common/components/errors/errorToast";

import { useRouter } from "@/i18n/routing";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CommonDeleterProps = {
  title: string;
  subtitle: string;
  description: string;
  deleteFunction: () => Promise<void>;
  redirectTo?: string;
  forceShow?: boolean;
};

export default function CommonDeleter({
  deleteFunction,
  redirectTo,
  title,
  subtitle,
  description,
  forceShow,
}: CommonDeleterProps) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(forceShow || false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFunction();

      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    } catch (error) {
      errorToast({ title: t(`generic.errors.delete`), error: error });
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {forceShow ? null : (
        <AlertDialogTrigger asChild>
          <Button size="sm" variant={"ghost"} className="text-muted-foreground hover:text-destructive">
            <Trash2Icon />
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className={`flex max-h-[70vh] max-w-3xl flex-col overflow-y-auto`}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{subtitle}</AlertDialogDescription>
        </AlertDialogHeader>
        {description}
        <div className="flex justify-end">
          <Button
            className="mr-2"
            variant={"outline"}
            type={`button`}
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            {t(`generic.buttons.cancel`)}
          </Button>
          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            variant={"destructive"}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                {t(`generic.buttons.is_deleting`)}
                <LoaderCircleIcon className="animate-spin-slow h-5 w-5" />
              </>
            ) : (
              t(`generic.buttons.delete`)
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
