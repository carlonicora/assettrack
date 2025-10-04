import { Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";

@Injectable()
export class EquipmentCypherService {
  constructor(private readonly clsService: ClsService) {}

  default(params?: { searchField: string; blockCompanyAndUser?: boolean }): string {
    return `
      MATCH (${equipmentMeta.nodeName}:${equipmentMeta.labelName}${params ? ` {${params.searchField}: $searchValue}` : ``})
      WHERE $companyId IS NULL
      OR EXISTS {
        MATCH (${equipmentMeta.nodeName})-[:BELONGS_TO]-(company)
      }
      WITH ${equipmentMeta.nodeName}${params?.blockCompanyAndUser ? `` : `, company, currentUser`}
    `;
  }

  userHasAccess = (): string => {
    const companyId = this.clsService.get("companyId");
    const userId = this.clsService.get("userId");

    return `
      WITH ${equipmentMeta.nodeName}${companyId ? `, ${companyMeta.nodeName}` : ``}${userId ? `, currentUser` : ``}
    `;
  };

  returnStatement = () => {
    return `
      MATCH (${equipmentMeta.nodeName}:${equipmentMeta.labelName})-[:BELONGS_TO]->(${equipmentMeta.nodeName}_${companyMeta.nodeName}:${companyMeta.labelName})
      MATCH (${equipmentMeta.nodeName})<-[:SUPPLIES]-(${equipmentMeta.nodeName}_${supplierMeta.nodeName}:${supplierMeta.labelName})
      RETURN ${equipmentMeta.nodeName},
        ${equipmentMeta.nodeName}_${companyMeta.nodeName},
        ${equipmentMeta.nodeName}_${supplierMeta.nodeName}
    `;
  };
}