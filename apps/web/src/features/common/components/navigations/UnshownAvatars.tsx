"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UnshownAvatarsProps = {
  count: number;
  className?: string;
};

export default function UnshownAvatars({ count, className }: UnshownAvatarsProps) {
  return (
    <div className="*:ring-1 *:ring-border">
      <Avatar className={`h-6 w-6 ${className}`}>
        <AvatarFallback>{`+${count.toString()}`}</AvatarFallback>
      </Avatar>
    </div>
  );
}
