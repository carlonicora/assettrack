"use client";

import { Link } from "@/components/custom-ui/link";
import { cellDate } from "@/features/common/components/tables/cells/cell.date";
import { cellId } from "@/features/common/components/tables/cells/cell.id";
import { cellLink } from "@/features/common/components/tables/cells/cell.link";
import { cellText } from "@/features/common/components/tables/cells/cell.text";
import { TableContent, UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { EmployeeFields } from "@/features/features/employee/data/EmployeeFields";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { registerTableGenerator } from "@/hooks/useTableGenerator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const useEmployeeTableStructure: UseTableStructureHook<EmployeeInterface, EmployeeFields> = (params) => {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  const tableData = useMemo(() => {
    return params.data.map((employee: EmployeeInterface) => {
      const entry: TableContent<EmployeeInterface> = {
        jsonApiData: employee,
      };
      entry[EmployeeFields.employeeId] = employee.id;
      params.fields.forEach((field) => {
        entry[field] = employee[field as keyof EmployeeInterface];
      });
      return entry;
    });
  }, [params.data, params.fields]);

  const fieldColumnMap: Partial<Record<EmployeeFields, () => any>> = {
    [EmployeeFields.employeeId]: () =>
      cellId({
        name: "employeeId",
        checkedIds: params.checkedIds,
        toggleId: params.toggleId,
      }),
    [EmployeeFields.name]: () => ({
      id: "name",
      accessorKey: "name",
      header: t(`features.employee.fields.name.label`),
      cell: ({ row }: { row: TableContent<EmployeeInterface> }) => {
        const employee: EmployeeInterface = row.original.jsonApiData;
        return <Link href={generateUrl({ page: Modules.Employee, id: employee.id })}>{employee.name}</Link>;
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [EmployeeFields.phone]: () => ({
      id: "phone",
      accessorKey: "phone",
      header: t(`features.employee.fields.phone.label`),
      cell: ({ row }: { row: TableContent<EmployeeInterface> }) => (
        <>{row.getValue("phone")}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [EmployeeFields.email]: () => ({
      id: "email",
      accessorKey: "email",
      header: t(`features.employee.fields.email.label`),
      cell: ({ row }: { row: TableContent<EmployeeInterface> }) => (
        <>{row.getValue("email")}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [EmployeeFields.avatar]: () => ({
      id: "avatar",
      accessorKey: "avatar",
      header: t(`features.employee.fields.avatar.label`),
      cell: ({ row }: { row: TableContent<EmployeeInterface> }) => (
        <>{row.getValue("avatar")}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [EmployeeFields.createdAt]: () =>
      cellDate({
        name: "createdAt",
        title: t(`generic.date.create`),
      }),
    [EmployeeFields.updatedAt]: () =>
      cellDate({
        name: "updatedAt",
        title: t(`generic.date.update`),
      }),
  };

  const columns = useMemo(() => {
      return params.fields
      .map((field) => fieldColumnMap[field]?.())
      .filter((col) => col !== undefined) as ColumnDef<TableContent<EmployeeInterface>>[];
  }, [params.fields, fieldColumnMap, t, generateUrl]);

  return useMemo(() => ({ data: tableData, columns: columns }), [tableData, columns]);
};

registerTableGenerator(Modules.Employee, useEmployeeTableStructure);
