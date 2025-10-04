"use client";

import { Button } from "@/components/ui/button";
import { CommandDialog } from "@/components/ui/command";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { RoleService } from "@/features/foundations/role/data/RoleService";
import UserAddCommand from "@/features/foundations/user/components/forms/UserAddCommand";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { UserService } from "@/features/foundations/user/data/UserService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import useDebounce from "@/hooks/useDebounce";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type AddUserToRoleProps = {
  role: RoleInterface;
  refresh: () => Promise<void>;
};

function AddUserToRoleInternal({ role, refresh }: AddUserToRoleProps) {
  const { company } = useCurrentUserContext();
  const [show, setShow] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<UserInterface[]>([]);
  const t = useTranslations();

  const [existingUsers, setExistingUsers] = useState<UserInterface[] | null>(null);
  useEffect(() => {
    const fetchExistingUsers = async () => {
      setExistingUsers(await UserService.findMany({ roleId: role.id, fetchAll: true }));
    };
    if (show) {
      setExistingUsers(null);
      fetchExistingUsers();
    }
  }, [show]);

  const addUserToRole = async (user: UserInterface) => {
    await RoleService.addUserToRole({
      roleId: role.id,
      userId: user.id,
    });
    setUsers(users.filter((u) => u.id !== user.id));

    toast.message(t(`foundations.user.add_to_role.label`), {
      description: t(`foundations.user.add_to_role.success`, {
        roleName: t(`foundations.role.roles`, { role: role.id.replaceAll(`-`, ``) }),
        userName: user.name,
      }),
    });

    refresh();
  };

  const data: DataListRetriever<UserInterface> = useDataListRetriever({
    retriever: (params) => UserService.findAllUsers(params),
    retrieverParams: { companyId: company?.id },
    module: Modules.User,
  });

  const searchUsers = useCallback(
    async (term: string) => {
      setUsers(
        await UserService.findAllUsersNotInRole({
          search: term,
          roleId: role.id,
        }),
      );
    },
    [searchTerm, role],
  );

  const updateSearchTerm = useDebounce(searchUsers, 500);

  useEffect(() => {
    if (show) updateSearchTerm(searchTerm);
  }, [show, searchTerm]);

  return (
    <>
      <Button size="sm" onClick={() => setShow(true)}>
        <PlusCircle className="mr-3 h-3.5 w-3.5" />
        {t(`foundations.user.buttons.add`)}
      </Button>
      <CommandDialog open={show} onOpenChange={setShow}>
        <DialogHeader className="flex flex-col items-start p-4 pb-0">
          <DialogTitle className="my-2 flex w-full justify-center text-xl font-bold">
            {t(`foundations.user.add_to_role.label`)}
          </DialogTitle>
          <DialogDescription>
            {t(`foundations.user.add_to_role.description`, {
              name: t(`foundations.role.roles`, { role: role.id.replaceAll(`-`, ``) }),
            })}
          </DialogDescription>
        </DialogHeader>
        <UserAddCommand
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          data={data}
          existingUsers={existingUsers || []}
          add={addUserToRole}
        />
      </CommandDialog>
    </>
  );
}

export default function AddUserToRole(props: AddUserToRoleProps) {
  return withPermissions({
    Component: AddUserToRoleInternal,
    modules: [Modules.User],
    action: Action.Update,
    data: props.role,
  })(props);
}
