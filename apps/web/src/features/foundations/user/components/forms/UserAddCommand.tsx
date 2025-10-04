import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import UserAvatar from "@/features/foundations/user/components/widgets/UserAvatar";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { DataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import { Action } from "@/permisions/types";
import withPermissions from "@/permisions/wrappers/withPermissions";
import { useTranslations } from "next-intl";
import React from "react";

type UserAddCommandProps = {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  data: DataListRetriever<UserInterface>;
  existingUsers: UserInterface[];
  add: (user: UserInterface) => Promise<void>;
};

function UserAddCommandInternal({ searchTerm, setSearchTerm, data, existingUsers, add }: UserAddCommandProps) {
  const t = useTranslations();
  return (
    <Command shouldFilter={false} className="p-4">
      <CommandInput
        placeholder={t(`foundations.user.search.placeholder`)}
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList className="mt-3 h-auto max-h-96 min-h-96 max-w-full overflow-x-hidden overflow-y-auto">
        <CommandEmpty>{t(`foundations.user.search.no_results`)}</CommandEmpty>
        {data.data !== undefined &&
          (data.data as UserInterface[])
            .filter(
              (user: UserInterface) =>
                existingUsers && !existingUsers.find((existingUser: UserInterface) => existingUser.id === user.id),
            )
            .map((user: UserInterface) => {
              return (
                <React.Fragment key={user.id}>
                  <CommandItem
                    className="cursor-pointer"
                    key={user.id}
                    onClick={(e) => {
                      add(user);
                    }}
                    onSelect={(e) => {
                      add(user);
                    }}
                  >
                    <div className="flex w-full flex-row items-center justify-between px-4 py-1">
                      <UserAvatar user={user} />
                      <div className="ml-5 flex w-full flex-col">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs font-normal">{user.email}</div>
                      </div>
                    </div>
                  </CommandItem>
                </React.Fragment>
              );
            })}
      </CommandList>
    </Command>
  );
}

export default function UserAddCommand(props: UserAddCommandProps) {
  return withPermissions({
    Component: UserAddCommandInternal,
    modules: [Modules.User],
    action: Action.Read,
  })(props);
}
