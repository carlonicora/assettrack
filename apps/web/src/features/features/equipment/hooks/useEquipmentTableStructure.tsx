"use client";

import { Link } from "@/components/custom-ui/link";
import { cellDate } from "@/features/common/components/tables/cells/cell.date";
import { cellId } from "@/features/common/components/tables/cells/cell.id";
import { TableContent, UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { EquipmentFields } from "@/features/features/equipment/data/EquipmentFields";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { registerTableGenerator } from "@/hooks/useTableGenerator";
import { cn } from "@/lib/utils";
import { Modules } from "@/modules/modules";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const useEquipmentTableStructure: UseTableStructureHook<EquipmentInterface, EquipmentFields> = (params) => {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  const tableData = useMemo(() => {
    return params.data.map((equipment: EquipmentInterface) => {
      const entry: TableContent<EquipmentInterface> = {
        jsonApiData: equipment,
      };
      entry[EquipmentFields.equipmentId] = equipment.id;
      params.fields.forEach((field) => {
        entry[field] = equipment[field as keyof EquipmentInterface];
      });
      return entry;
    });
  }, [params.data, params.fields]);

  const fieldColumnMap: Partial<Record<EquipmentFields, () => any>> = {
    [EquipmentFields.equipmentId]: () =>
      cellId({
        name: "equipmentId",
        checkedIds: params.checkedIds,
        toggleId: params.toggleId,
      }),
    [EquipmentFields.name]: () => ({
      id: "name",
      accessorKey: "name",
      header: t(`features.equipment.fields.name.label`),
      cell: ({ row }: { row: TableContent<EquipmentInterface> }) => {
        const equipment: EquipmentInterface = row.original.jsonApiData;
        return <Link href={generateUrl({ page: Modules.Equipment, id: equipment.id })}>{equipment.name}</Link>;
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.supplier]: () => ({
      id: "supplier",
      accessorKey: "supplier",
      header: t(`features.equipment.relationships.supplier.label`),
      cell: ({ row }: { row: TableContent<EquipmentInterface> }) => {
        const equipment: EquipmentInterface = row.original.jsonApiData;
        return (
          <Link href={generateUrl({ page: Modules.Supplier, id: equipment.supplier.id })}>
            {equipment.supplier.name}
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.employee]: () => ({
      id: "employee",
      accessorKey: "employee",
      header: t(`types.employees`, { count: 1 }),
      cell: ({ row }: { row: TableContent<EquipmentInterface> }) => {
        const equipment: EquipmentInterface = row.original.jsonApiData;
        if (!equipment?.currentLoan?.employee) return <></>;

        return (
          <Link href={generateUrl({ page: Modules.Employee, id: equipment.currentLoan.employee.id })}>
            {equipment.currentLoan.employee.name}
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.barcode]: () => ({
      id: "barcode",
      accessorKey: "barcode",
      header: t(`features.equipment.fields.barcode.label`),
      cell: ({ row }: { row: TableContent<EquipmentInterface> }) => <>{row.getValue("barcode")}</>,
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.description]: () => ({
      id: "description",
      accessorKey: "description",
      header: t(`features.equipment.fields.description.label`),
      cell: ({ row }: { row: TableContent<EquipmentInterface> }) => <>{row.getValue("description")}</>,
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.startDate]: () =>
      cellDate({
        name: "startDate",
        title: t(`features.equipment.fields.startDate.label`),
      }),
    [EquipmentFields.endDate]: () =>
      cellDate({
        name: "endDate",
        title: t(`features.equipment.fields.endDate.label`),
      }),
    [EquipmentFields.endDateOverdue]: () => ({
      id: "endDate",
      accessorKey: "endDate",
      header: t(`features.equipment.fields.endDate.label`),
      cell: ({ row }) => {
        const equipment: EquipmentInterface = row.original.jsonApiData;
        if (!equipment?.endDate) return <></>;

        return (
          <span
            className={cn(`text-muted-foreground text-xs`, equipment.endDate < new Date() ? `text-destructive` : ``)}
          >
            {equipment?.endDate.toLocaleDateString("it", { dateStyle: "medium" })}
          </span>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.status]: () => ({
      id: "status",
      accessorKey: "status",
      header: t(`features.equipment.fields.status.label`),
      cell: ({ row }: { row: TableContent<EquipmentInterface> }) => (
        <>{t(`features.equipment.fields.status.select`, { type: row.getValue("status") })}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [EquipmentFields.createdAt]: () =>
      cellDate({
        name: "createdAt",
        title: t(`generic.date.create`),
      }),
    [EquipmentFields.updatedAt]: () =>
      cellDate({
        name: "updatedAt",
        title: t(`generic.date.update`),
      }),
  };

  const columns = useMemo(() => {
    return params.fields.map((field) => fieldColumnMap[field]?.()).filter((col) => col !== undefined) as ColumnDef<
      TableContent<EquipmentInterface>
    >[];
  }, [params.fields, fieldColumnMap, t, generateUrl]);

  return useMemo(() => ({ data: tableData, columns: columns }), [tableData, columns]);
};

registerTableGenerator(Modules.Equipment, useEquipmentTableStructure);
