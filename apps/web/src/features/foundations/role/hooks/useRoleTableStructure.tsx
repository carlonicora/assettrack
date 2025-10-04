"use client";

import { Link } from "@/components/custom-ui/link";
import { cellDate } from "@/features/common/components/tables/cells/cell.date";
import { cellId } from "@/features/common/components/tables/cells/cell.id";
import { TableContent, UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { RoleFields } from "@/features/foundations/role/data/RoleFields";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { registerTableGenerator } from "@/hooks/useTableGenerator";
import { Modules } from "@/modules/modules";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const useRoleTableStructure: UseTableStructureHook<RoleInterface, RoleFields> = (params) => {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  // Memoize tableData to prevent infinite re-renders
  const tableData = useMemo(() => {
    return params.data.map((role: RoleInterface) => {
      const entry: TableContent<RoleInterface> = {
        jsonApiData: role,
      };
      entry[RoleFields.roleId] = role.id;
      params.fields.forEach((field) => {
        entry[field] = role[field as keyof RoleInterface];
      });
      return entry;
    });
  }, [params.data, params.fields]);

  const fieldColumnMap: Partial<Record<RoleFields, () => any>> = {
    [RoleFields.roleId]: () =>
      cellId({
        name: "roleId",
        checkedIds: params.checkedIds,
        toggleId: params.toggleId,
      }),
    [RoleFields.name]: () => ({
      id: "name",
      accessorKey: "name",
      header: t(`foundations.role.fields.name.label`),
      cell: ({ row }: { row: Row<TableContent<RoleInterface>> }) => {
        const role = row.original.jsonApiData as RoleInterface;
        return <Link href={generateUrl({ page: Modules.Role, id: role.id })}>{row.getValue("name")}</Link>;
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [RoleFields.description]: () => ({
      id: "description",
      accessorKey: "description",
      header: t(`foundations.role.fields.description.label`),
      cell: ({ row }: { row: Row<TableContent<RoleInterface>> }) => <>{row.getValue("description")}</>,
      enableSorting: false,
      enableHiding: false,
    }),
    [RoleFields.createdAt]: () =>
      cellDate({
        name: "createdAt",
        title: t(`generic.date.create`),
      }),
  };

  // Memoize columns to prevent infinite re-renders
  const columns = useMemo(() => {
    return params.fields.map((field) => fieldColumnMap[field]?.()).filter((col) => col !== undefined) as ColumnDef<
      TableContent<RoleInterface>
    >[];
  }, [params.fields, fieldColumnMap, t, generateUrl]);

  // Memoize the return object to prevent infinite re-renders
  return useMemo(() => ({ data: tableData, columns: columns }), [tableData, columns]);
};

registerTableGenerator(Modules.Role, useRoleTableStructure);
