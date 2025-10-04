"use client";

import { Link } from "@/components/custom-ui/link";
import { cellDate } from "@/features/common/components/tables/cells/cell.date";
import { cellId } from "@/features/common/components/tables/cells/cell.id";
import { cellLink } from "@/features/common/components/tables/cells/cell.link";
import { cellText } from "@/features/common/components/tables/cells/cell.text";
import { TableContent, UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { SupplierFields } from "@/features/features/supplier/data/SupplierFields";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { registerTableGenerator } from "@/hooks/useTableGenerator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const useSupplierTableStructure: UseTableStructureHook<SupplierInterface, SupplierFields> = (params) => {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();

  const tableData = useMemo(() => {
    return params.data.map((supplier: SupplierInterface) => {
      const entry: TableContent<SupplierInterface> = {
        jsonApiData: supplier,
      };
      entry[SupplierFields.supplierId] = supplier.id;
      params.fields.forEach((field) => {
        entry[field] = supplier[field as keyof SupplierInterface];
      });
      return entry;
    });
  }, [params.data, params.fields]);

  const fieldColumnMap: Partial<Record<SupplierFields, () => any>> = {
    [SupplierFields.supplierId]: () =>
      cellId({
        name: "supplierId",
        checkedIds: params.checkedIds,
        toggleId: params.toggleId,
      }),
    [SupplierFields.name]: () => ({
      id: "name",
      accessorKey: "name",
      header: t(`features.supplier.fields.name.label`),
      cell: ({ row }: { row: TableContent<SupplierInterface> }) => {
        const supplier: SupplierInterface = row.original.jsonApiData;
        return <Link href={generateUrl({ page: Modules.Supplier, id: supplier.id })}>{supplier.name}</Link>;
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [SupplierFields.address]: () => ({
      id: "address",
      accessorKey: "address",
      header: t(`features.supplier.fields.address.label`),
      cell: ({ row }: { row: TableContent<SupplierInterface> }) => (
        <>{row.getValue("address")}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [SupplierFields.email]: () => ({
      id: "email",
      accessorKey: "email",
      header: t(`features.supplier.fields.email.label`),
      cell: ({ row }: { row: TableContent<SupplierInterface> }) => (
        <>{row.getValue("email")}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [SupplierFields.phone]: () => ({
      id: "phone",
      accessorKey: "phone",
      header: t(`features.supplier.fields.phone.label`),
      cell: ({ row }: { row: TableContent<SupplierInterface> }) => (
        <>{row.getValue("phone")}</>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    [SupplierFields.createdAt]: () =>
      cellDate({
        name: "createdAt",
        title: t(`generic.date.create`),
      }),
    [SupplierFields.updatedAt]: () =>
      cellDate({
        name: "updatedAt",
        title: t(`generic.date.update`),
      }),
  };

  const columns = useMemo(() => {
      return params.fields
      .map((field) => fieldColumnMap[field]?.())
      .filter((col) => col !== undefined) as ColumnDef<TableContent<SupplierInterface>>[];
  }, [params.fields, fieldColumnMap, t, generateUrl]);

  return useMemo(() => ({ data: tableData, columns: columns }), [tableData, columns]);
};

registerTableGenerator(Modules.Supplier, useSupplierTableStructure);
