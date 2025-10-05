import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export const cellDate = (params: { name: string; title: string; highlightExpired?: boolean }): ColumnDef<any> => {
  return {
    id: params.name,
    accessorKey: params.name,
    header: params.title,
    cell: ({ row }) => (
      <span className={cn(`text-muted-foreground text-xs`, params.highlightExpired ? `text-destructive` : ``)}>
        {row.getValue<Date>(params.name)
          ? row.getValue<Date>(params.name).toLocaleDateString("it", { dateStyle: "medium" })
          : ""}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  };
};
