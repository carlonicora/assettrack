import { Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { companyMeta } from "src/foundations/company/entities/company.meta";

@Injectable()
export class SupplierCypherService {
  constructor(private readonly clsService: ClsService) {}

  default(params?: { searchField: string; blockCompanyAndUser?: boolean }): string {
    return `
      MATCH (${supplierMeta.nodeName}:${supplierMeta.labelName}${params ? ` {${params.searchField}: $searchValue}` : ``})
      WHERE $companyId IS NULL
      OR EXISTS {
        MATCH (${supplierMeta.nodeName})-[:BELONGS_TO]-(company)
      }
      WITH ${supplierMeta.nodeName}${params?.blockCompanyAndUser ? `` : `, company, currentUser`}
    `;
  }

  userHasAccess = (): string => {
    const companyId = this.clsService.get("companyId");
    const userId = this.clsService.get("userId");

    return `
      WITH ${supplierMeta.nodeName}${companyId ? `, ${companyMeta.nodeName}` : ``}${userId ? `, currentUser` : ``}
    `;
  };

  returnStatement = () => {
    return `
      MATCH (${supplierMeta.nodeName}:${supplierMeta.labelName})-[:BELONGS_TO]->(${supplierMeta.nodeName}_${companyMeta.nodeName}:${companyMeta.labelName})
      RETURN ${supplierMeta.nodeName},
        ${supplierMeta.nodeName}_${companyMeta.nodeName}
    `;
  };
}