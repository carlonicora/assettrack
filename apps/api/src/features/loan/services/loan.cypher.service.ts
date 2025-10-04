import { Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";

@Injectable()
export class LoanCypherService {
  constructor(private readonly clsService: ClsService) {}

  default(params?: { searchField: string; blockCompanyAndUser?: boolean }): string {
    return `
      MATCH (${loanMeta.nodeName}:${loanMeta.labelName}${params ? ` {${params.searchField}: $searchValue}` : ``})
      WHERE $companyId IS NULL
      OR EXISTS {
        MATCH (${loanMeta.nodeName})-[:BELONGS_TO]-(company)
      }
      WITH ${loanMeta.nodeName}${params?.blockCompanyAndUser ? `` : `, company, currentUser`}
    `;
  }

  userHasAccess = (): string => {
    const companyId = this.clsService.get("companyId");
    const userId = this.clsService.get("userId");

    return `
      WITH ${loanMeta.nodeName}${companyId ? `, ${companyMeta.nodeName}` : ``}${userId ? `, currentUser` : ``}
    `;
  };

  returnStatement = () => {
    return `
      MATCH (${loanMeta.nodeName}:${loanMeta.labelName})-[:BELONGS_TO]->(${loanMeta.nodeName}_${companyMeta.nodeName}:${companyMeta.labelName})
      MATCH (${loanMeta.nodeName})<-[:RECEIVES]-(${loanMeta.nodeName}_${employeeMeta.nodeName}:${employeeMeta.labelName})
      MATCH (${loanMeta.nodeName})<-[:LOANED_THROUGH]-(${loanMeta.nodeName}_${equipmentMeta.nodeName}:${equipmentMeta.labelName})
      RETURN ${loanMeta.nodeName},
        ${loanMeta.nodeName}_${companyMeta.nodeName},
        ${loanMeta.nodeName}_${employeeMeta.nodeName},
        ${loanMeta.nodeName}_${equipmentMeta.nodeName}
    `;
  };
}
