"use client";

import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/features/foundations/user/components/widgets/UserAvatar";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { useUserContext } from "@/features/foundations/user/contexts/UserContext";

export default function UserIndexDetails() {
  const { user } = useUserContext();
  const { currentUser } = useCurrentUserContext();
  if (!user || !currentUser) return null;

  return (
    <div className="flex w-full flex-row gap-x-4">
      <Card className="min-h-96 w-96 flex-shrink-0 self-start p-2">
        <CardContent className="flex h-full flex-col gap-y-4 p-2">
          <div className="flex w-full justify-start gap-x-4">
            {user.avatar && <UserAvatar user={user} className="h-40 w-40" />}
            <div className="flex flex-col justify-start gap-y-2">
              <div className="text-primary text-2xl font-semibold">{user.name}</div>
              <div className="text-muted-foreground text-xs">{user.bio ?? ""}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
