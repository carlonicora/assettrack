"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { RoleService } from "@/features/foundations/role/data/RoleService";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import useDebounce from "@/hooks/useDebounce";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type UserRoleAddProps = {
  user: UserInterface;
  refresh: () => Promise<void>;
};

export default function UserRoleAdd({ user, refresh }: UserRoleAddProps) {
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roles, setRoles] = useState<RoleInterface[]>([]);
  const t = useTranslations();

  const addUserToRole = async (role: RoleInterface) => {
    await RoleService.addUserToRole({
      roleId: role.id,
      userId: user.id,
    });
    setRoles(roles.filter((u) => u.id !== role.id));

    toast.message(t(`foundations.role.add_to_user.label`), {
      description: t(`foundations.role.add_to_user.success`, {
        userName: user.name,
        roleName: t(`foundations.role.roles`, { role: role.id.replaceAll(`-`, ``) }),
      }),
    });

    refresh();
  };

  const searchRoles = useCallback(
    async (term: string) => {
      setRoles(
        await RoleService.findAllRolesUserNotIn({
          search: term,
          userId: user.id,
        }),
      );
    },
    [searchTerm, user],
  );

  const updateSearchTerm = useDebounce(searchRoles, 500);

  useEffect(() => {
    if (open) updateSearchTerm(searchTerm);
  }, [open, searchTerm]);

  useEffect(() => {
    if (open) searchRoles("");
  }, [open]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusCircle className="mr-3 h-3.5 w-3.5" />
        {t(`types.roles`, { count: 2 })}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="my-2 flex w-full justify-center text-xl font-bold">
          {t(`foundations.role.add_to_user.label`)}
        </DialogTitle>
        <DialogDescription>{t(`foundations.role.add_to_user.description`, { name: user.name })}</DialogDescription>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t(`foundations.role.search.placeholder`)}
            value={searchTerm}
            onValueChange={setSearchTerm}
            ref={inputRef}
          />
          <CommandList className="mt-3 h-auto max-h-96 min-h-96 max-w-full overflow-x-hidden overflow-y-auto">
            <CommandEmpty>{t(`foundations.role.search.no_results`)}</CommandEmpty>
            {roles.map((role: RoleInterface) => (
              <CommandItem
                className="cursor-pointer"
                key={role.id}
                onSelect={() => addUserToRole(role)}
                onClick={() => addUserToRole(role)}
              >
                {t(`foundations.role.roles`, { role: role.id.replaceAll(`-`, ``) })}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
