"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ContentListTableLoader() {
  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <div className="w-full">
          <div className="bg-muted font-semibold">
            <div className="flex">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-1 p-4">
                  <Skeleton className="bg-muted-foreground h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, rowIdx) => (
            <div className="flex border-b" key={rowIdx}>
              {[...Array(4)].map((_, colIdx) => (
                <div key={colIdx} className="flex-1 p-4">
                  <Skeleton className="bg-muted-foreground h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Skeleton className="bg-muted-foreground inline-block h-8 w-20 rounded" />
          <Skeleton className="bg-muted-foreground inline-block h-8 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}
