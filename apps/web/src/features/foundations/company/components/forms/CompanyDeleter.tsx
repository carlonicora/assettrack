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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorToast } from "@/features/common/components/errors/errorToast";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { CompanyService } from "@/features/foundations/company/data/CompanyService";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";

import { useRouter } from "@/i18n/routing";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CompanyDeleterProps = {
  company: CompanyInterface;
};

function CompanyDeleterInternal({ company }: CompanyDeleterProps) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await CompanyService.delete({ companyId: company.id });
      router.push("/");
    } catch (error) {
      errorToast({ title: t(`generic.errors.delete`), error: error });
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={"destructive"}>
          <Trash2Icon className="mr-3 h-3.5 w-3.5" />
          {t(`generic.buttons.delete`)}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={`flex max-h-[70vh] max-w-3xl flex-col overflow-y-auto`}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`foundations.company.delete.title`)}</AlertDialogTitle>
          <AlertDialogDescription>{t(`foundations.company.delete.subtitle`)}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex w-full flex-col gap-y-2">
          <div>{t(`foundations.company.delete.description`)}</div>
          <div>{t(`foundations.company.delete.confirmation`)}</div>
          <div className="flex w-full flex-col">
            <Label className="flex items-center">
              {t(`foundations.company.fields.name.label`)}
              <span className="text-destructive ml-2 font-semibold">*</span>
            </Label>
            <Input
              className={`w-full`}
              placeholder={t(`foundations.company.fields.name.placeholder`)}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </div>
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
            disabled={company.name !== companyName || isDeleting}
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

export default function CompanyDeleter({ company }: CompanyDeleterProps) {
  const { hasPermissionToModule, hasRole } = useCurrentUserContext();

  if (!hasRole(AuthRole.Administrator) && !hasPermissionToModule({ module: Modules.Company, action: Action.Delete }))
    return null;

  return withPermissions({
    Component: CompanyDeleterInternal,
    modules: [Modules.Company],
    action: Action.Delete,
  })({ company });
}
