"use client";

import { Link } from "@/components/custom-ui/link";
import { cellDate } from "@/features/common/components/tables/cells/cell.date";
import { cellId } from "@/features/common/components/tables/cells/cell.id";
import { cellLink } from "@/features/common/components/tables/cells/cell.link";
import { cellText } from "@/features/common/components/tables/cells/cell.text";
import { TableContent, UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { LoanFields } from "@/features/features/loan/data/LoanFields";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { registerTableGenerator } from "@/hooks/useTableGenerator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export const useLoanTableStructure: UseTableStructureHook<LoanInterface, LoanFields> = (params) => {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  const tableData = useMemo(() => {
    return params.data.map((loan: LoanInterface) => {
      const entry: TableContent<LoanInterface> = {
        jsonApiData: loan,
      };
      entry[LoanFields.loanId] = loan.id;
      params.fields.forEach((field) => {
        entry[field] = loan[field as keyof LoanInterface];
      });
      return entry;
    });
  }, [params.data, params.fields]);

  const fieldColumnMap: Partial<Record<LoanFields, () => any>> = {
    [LoanFields.loanId]: () =>
      cellId({
        name: "loanId",
        checkedIds: params.checkedIds,
        toggleId: params.toggleId,
      }),
    [LoanFields.name]: () => ({
      id: "name",
      accessorKey: "name",
      header: t(`features.loan.fields.name.label`),
      cell: ({ row }: { row: TableContent<LoanInterface> }) => {
        const loan: LoanInterface = row.original.jsonApiData;
        return <Link href={generateUrl({ page: Modules.Loan, id: loan.id })}>{loan.name}</Link>;
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [LoanFields.startDate]: () =>
      cellDate({
        name: "startDate",
        title: t(`features.loan.fields.startDate.label`),
      }),
    [LoanFields.endDate]: () =>
      cellDate({
        name: "endDate",
        title: t(`features.loan.fields.endDate.label`),
      }),
    [LoanFields.employee]: () => ({
      id: "employee",
      accessorKey: "employee",
      header: t(`features.loan.relationships.employee.label`),
      cell: ({ row }: { row: TableContent<LoanInterface> }) => {
        const loan: LoanInterface = row.original.jsonApiData;
        return (
          <Link href={generateUrl({ page: Modules.Employee, id: loan.employee.id })}>
            {loan.employee.name}
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [LoanFields.equipment]: () => ({
      id: "equipment",
      accessorKey: "equipment",
      header: t(`features.loan.relationships.equipment.label`),
      cell: ({ row }: { row: TableContent<LoanInterface> }) => {
        const loan: LoanInterface = row.original.jsonApiData;
        return (
          <Link href={generateUrl({ page: Modules.Equipment, id: loan.equipment.id })}>
            {loan.equipment.name}
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),






    [LoanFields.createdAt]: () =>
      cellDate({
        name: "createdAt",
        title: t(`generic.date.create`),
      }),
    [LoanFields.updatedAt]: () =>
      cellDate({
        name: "updatedAt",
        title: t(`generic.date.update`),
      }),
  };

  const columns = useMemo(() => {
      return params.fields
      .map((field) => fieldColumnMap[field]?.())
      .filter((col) => col !== undefined) as ColumnDef<TableContent<LoanInterface>>[];
  }, [params.fields, fieldColumnMap, t, generateUrl]);

  return useMemo(() => ({ data: tableData, columns: columns }), [tableData, columns]);
};

registerTableGenerator(Modules.Loan, useLoanTableStructure);
