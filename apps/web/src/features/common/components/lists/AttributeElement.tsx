"use client";

import { cn } from "@/lib/utils";
import { ReactElement } from "react";

type AttributeElementProps = {
  inline?: boolean;
  title?: string | ReactElement<any>;
  value?: string | ReactElement<any>;
  className?: string;
};

export default function AttributeElement({ inline, title, value, className }: AttributeElementProps) {
  return (
    <div className={cn(`flex ${inline === true ? "flex-row" : "flex-col"} my-1 justify-start`, className)}>
      {title && <div className={`${inline === true ? "min-w-48 pr-4" : "w-full"} text-sm font-semibold`}>{title}</div>}
      {value && <div className="flex w-full flex-col text-sm">{value}</div>}
    </div>
  );
}
