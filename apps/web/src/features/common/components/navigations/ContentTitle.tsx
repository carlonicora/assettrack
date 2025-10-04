"use client";

import { ReactNode } from "react";

type TitleProps = {
  type?: string | string[];
  element?: string;
  functions?: ReactNode;
};

export default function ContentTitle({ type, element, functions }: TitleProps) {
  return (
    <div className="mb-4 flex w-full flex-col">
      {(type || functions) && (
        <div className="flex flex-row items-center justify-between gap-x-4">
          {type && <div className={`text-muted-foreground text-xl font-light`}>{type}</div>}
          {functions && <div className="flex flex-row items-center justify-start">{functions}</div>}
        </div>
      )}
      <div className={`text-primary w-full text-3xl font-semibold`}>{element}</div>
    </div>
  );
}
