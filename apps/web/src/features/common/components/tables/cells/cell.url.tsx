import { Link } from "@/components/custom-ui/link";
import { ColumnDef } from "@tanstack/react-table";

export const cellUrl = (params: { name: string; title: string }): ColumnDef<any> => {
  return {
    id: params.name,
    accessorKey: params.name,
    header: params.title,
    cell: ({ row }) => <Link href={row.getValue(params.name)}>{row.getValue(params.name)}</Link>,
    enableSorting: false,
    enableHiding: false,
  };
};
