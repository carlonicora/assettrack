"use client";

import { Link } from "@/components/custom-ui/link";
import { cellDate } from "@/features/common/components/tables/cells/cell.date";
import { cellId } from "@/features/common/components/tables/cells/cell.id";
import { TableContent, UseTableStructureHook } from "@/features/common/interfaces/table.structure.generator.interface";
import { CompanyFields } from "@/features/foundations/company/data/CompanyFields";
import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { useCurrentUserContext } from "@/features/foundations/user/contexts/CurrentUserContext";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { registerTableGenerator } from "@/hooks/useTableGenerator";
import { Modules } from "@/modules/modules";
import { AuthRole } from "@/permisions/enums/AuthRole";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const useCompanyTableStructure: UseTableStructureHook<CompanyInterface, CompanyFields> = (params) => {
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();
  const { hasRole } = useCurrentUserContext();

  // Memoize tableData to prevent infinite re-renders
  const tableData = useMemo(() => {
    return params.data.map((company: CompanyInterface) => {
      const entry: TableContent<CompanyInterface> = {
        jsonApiData: company,
      };
      entry[CompanyFields.companyId] = company.id;
      params.fields.forEach((field) => {
        entry[field] = company[field as keyof CompanyInterface];
      });
      return entry;
    });
  }, [params.data, params.fields]);

  const fieldColumnMap: Partial<Record<CompanyFields, () => any>> = {
    [CompanyFields.companyId]: () =>
      cellId({
        name: "companyId",
        checkedIds: params.checkedIds,
        toggleId: params.toggleId,
      }),
    [CompanyFields.name]: () => ({
      id: "name",
      accessorKey: "name",
      header: t(`foundations.user.fields.name.label`),
      cell: ({ row }: { row: Row<TableContent<CompanyInterface>> }) => {
        const company = row.original.jsonApiData as CompanyInterface;
        return (
          <Link
            href={
              hasRole(AuthRole.Administrator)
                ? generateUrl({
                    page: "/administration",
                    id: Modules.Company.pageUrl?.substring(1),
                    childPage: company.id,
                  })
                : generateUrl({ page: Modules.Company, id: company.id })
            }
          >
            {row.getValue("name")}
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    [CompanyFields.createdAt]: () =>
      cellDate({
        name: "createdAt",
        title: t(`generic.date.create`),
      }),
  };

  // Memoize columns to prevent infinite re-renders
  const columns = useMemo(() => {
    return params.fields.map((field) => fieldColumnMap[field]?.()).filter((col) => col !== undefined) as ColumnDef<
      TableContent<CompanyInterface>
    >[];
  }, [params.fields, fieldColumnMap, t, generateUrl, hasRole]);

  // Memoize the return object to prevent infinite re-renders
  return useMemo(() => ({ data: tableData, columns: columns }), [tableData, columns]);
};

registerTableGenerator(Modules.Company, useCompanyTableStructure);
