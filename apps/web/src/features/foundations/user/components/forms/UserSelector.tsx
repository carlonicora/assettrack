"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserAvatar from "@/features/foundations/user/components/widgets/UserAvatar";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { UserService } from "@/features/foundations/user/data/UserService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import useDebounce from "@/hooks/useDebounce";
import { Modules } from "@/modules/modules";

import { CircleX, RefreshCwIcon, SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type UserSelectorProps = {
  id: string;
  form: any;
  label?: string;
  placeholder?: string;
  onChange?: (user?: UserInterface) => void;
  isRequired?: boolean;
};

export default function UserSelector({
  id,
  form,
  label,
  placeholder,
  onChange,
  isRequired = false,
}: UserSelectorProps) {
  const t = useTranslations();
  const { company } = useCurrentUserContext();

  const [open, setOpen] = useState<boolean>(false);

  const searchTermRef = useRef<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isSearching, setIsSearching] = useState<boolean>(false);

  const data: DataListRetriever<UserInterface> = useDataListRetriever({
    retriever: (params) => {
      return UserService.findAllUsers(params);
    },
    retrieverParams: { companyId: company?.id },
    module: Modules.User,
  });

  const search = useCallback(
    async (searchedTerm: string) => {
      try {
        if (searchedTerm === searchTermRef.current) return;
        setIsSearching(true);
        searchTermRef.current = searchedTerm;
        await data.search(searchedTerm);
      } finally {
        setIsSearching(false);
      }
    },
    [searchTermRef, data],
  );

  const updateSearchTerm = useDebounce(search, 500);

  useEffect(() => {
    setIsSearching(true);
    updateSearchTerm(searchTerm);
  }, [updateSearchTerm, searchTerm]);

  const setUser = (user?: UserInterface) => {
    if (onChange) onChange(user);
    if (!user) {
      form.setValue(id, undefined);
      setOpen(false);
      return;
    }

    form.setValue(id, { id: user.id, name: user.name, avatar: user.avatar });
    setOpen(false);

    setTimeout(() => {
      setOpen(false);
    }, 0);
  };

  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`${label ? "mb-5" : "mb-1"}`}>
            {label && (
              <FormLabel className="flex items-center">
                {label}
                {isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <Popover open={open} onOpenChange={setOpen} modal={true}>
                <div className="flex w-full flex-row items-center justify-between">
                  <PopoverTrigger className="w-full">
                    <div className="flex w-full flex-row items-center justify-start rounded-md">
                      {field.value ? (
                        <>
                          <div className="flex w-full flex-row items-center justify-start rounded-md border p-2">
                            <div className="*:ring-border *:ring-1">
                              <Avatar className={`mr-2 h-6 w-6`}>
                                <AvatarImage src={field.value?.avatar} />
                                <AvatarFallback>
                                  {field.value?.name
                                    ? field.value?.name.split(" ").map((name: string) => name.charAt(0).toUpperCase())
                                    : "X"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <span className="">{field.value?.name ?? ""}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground mr-7 flex h-10 w-full flex-row items-center justify-start rounded-md border p-2 text-sm">
                          {placeholder ?? t(`foundations.user.search.placeholder`)}
                        </div>
                      )}
                    </div>
                  </PopoverTrigger>
                  {field.value && (
                    <CircleX
                      className="text-muted hover:text-destructive ml-2 h-6 w-6 cursor-pointer"
                      onClick={() => setUser()}
                    />
                  )}
                </div>
                <PopoverContent>
                  <Command shouldFilter={false}>
                    <div className="relative mb-2 w-full">
                      <SearchIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                      <Input
                        placeholder={t(`foundations.user.search.placeholder`)}
                        type="text"
                        className="w-full pr-8 pl-8"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                      />
                      {isSearching ? (
                        <RefreshCwIcon className="text-muted-foreground absolute top-2.5 right-2.5 h-4 w-4 animate-spin" />
                      ) : searchTermRef.current ? (
                        <XIcon
                          className={`absolute top-2.5 right-2.5 h-4 w-4 ${searchTermRef.current ? "cursor-pointer" : "text-muted-foreground"}`}
                          onClick={() => {
                            setSearchTerm("");
                            search("");
                          }}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                    <CommandList>
                      {data.data &&
                        data.data.length > 0 &&
                        (data.data as UserInterface[]).map((user: UserInterface) => (
                          <CommandItem className="cursor-pointer" key={user.id} onSelect={() => setUser(user)}>
                            <UserAvatar user={user} className={`mr-2 h-4 w-4`} />
                            <span className="">{user.name}</span>
                          </CommandItem>
                        ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
