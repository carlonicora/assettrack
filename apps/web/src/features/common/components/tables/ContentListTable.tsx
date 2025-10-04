"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContentListTableLoader } from "@/features/common/components/tables/ContentListTableLoader";
import { DataListRetriever } from "@/hooks/useDataListRetriever";
import { useTableGenerator } from "@/hooks/useTableGenerator";
import { ModuleWithPermissions } from "@/permisions/types";
import { CaretLeftIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { ReactNode, memo, useMemo } from "react";

export type GenerateTableStructureParams = {
  data: any[];
  toggleValueToFormIdsId: (id: string, name: string) => void;
  isSelected: (id: string) => boolean;
};

type ContentListTableProps = {
  title?: string;
  data: DataListRetriever<any>;
  tableGenerator?: never;
  tableGeneratorType: ModuleWithPermissions;
  fields: any[];
  checkedIds?: string[];
  toggleId?: (id: string) => void;
  functions?: ReactNode;
};

export const ContentListTable = memo(function ContentListTable(props: ContentListTableProps) {
  const { data, fields, checkedIds, toggleId } = props;

  const { data: tableData, columns: tableColumns } = useTableGenerator(props.tableGeneratorType, {
    data: data?.data ?? [],
    fields: fields,
    checkedIds: checkedIds,
    toggleId: toggleId,
  });

  const columnVisibility = useMemo(
    () =>
      fields.reduce(
        (acc, columnId) => {
          acc[columnId] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    [fields],
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility,
    },
  });

  if (!data.isLoaded || !data.data) {
    return <ContentListTableLoader />;
  }

  const rowModel = tableData ? table.getRowModel() : null;

  return (
    <div className="flex w-full flex-col">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted font-semibold">
            {props.title && (
              <TableRow>
                <TableHead className="bg-card text-primary p-4 text-left font-bold" colSpan={tableColumns.length}>
                  {props.title}
                </TableHead>
              </TableRow>
            )}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowModel && rowModel.rows?.length ? (
              rowModel.rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="bg-card py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      data.previous?.(true);
                    }}
                    disabled={!data.previous}
                  >
                    <CaretLeftIcon className="h-4 w-4" />
                  </Button>
                  {props.functions && props.functions}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      data.next?.(true);
                    }}
                    disabled={!data.next}
                  >
                    <CaretRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
});
