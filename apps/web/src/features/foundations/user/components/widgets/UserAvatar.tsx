"use client";

import { Link } from "@/components/custom-ui/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { cn } from "@/lib/utils";
import { Modules } from "@/modules/modules";

type UserAvatarProps = {
  user: UserInterface;
  className?: string;
  showFull?: boolean;
  showLink?: boolean;
};

export default function UserAvatar({ user, className, showFull, showLink }: UserAvatarProps) {
  const generateUrl = usePageUrlGenerator();

  const getInitial = (param?: string) => {
    if (!param) return "";
    return param[0].toUpperCase();
  };

  const getInitials = (name: string) => {
    const words = name.split(" ");
    const initials =
      words.length > 1 ? getInitial(words[0][0]) + getInitial(words[words.length - 1][0]) : getInitial(words[0][0]);

    return initials ?? "";
  };

  const getAvatar = () => {
    return (
      <div className="*:ring-border *:ring-1">
        <Avatar className={`h-6 w-6 ${className}`}>
          <AvatarImage className="object-cover" src={user?.avatar} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </div>
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {showFull ? (
          <Link
            href={generateUrl({ page: Modules.User, id: user.id })}
            className={cn(`mb-2 flex w-full flex-row items-center justify-start gap-x-2 text-sm`, className)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full flex-row items-center gap-x-2">
              {getAvatar()}
              {user.name}
            </div>
          </Link>
        ) : showLink ? (
          <Link href={generateUrl({ page: Modules.User, id: user.id })} className={className}>
            {getAvatar()}
          </Link>
        ) : (
          getAvatar()
        )}
      </TooltipTrigger>
      <TooltipContent>{user.name}</TooltipContent>
    </Tooltip>
  );
}
