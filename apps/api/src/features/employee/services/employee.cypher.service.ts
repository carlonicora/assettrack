import { Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { companyMeta } from "src/foundations/company/entities/company.meta";

@Injectable()
export class EmployeeCypherService {
  constructor(private readonly clsService: ClsService) {}

  default(params?: { searchField: string; blockCompanyAndUser?: boolean }): string {
    return `
      MATCH (${employeeMeta.nodeName}:${employeeMeta.labelName}${params ? ` {${params.searchField}: $searchValue}` : ``})
      WHERE $companyId IS NULL
      OR EXISTS {
        MATCH (${employeeMeta.nodeName})-[:BELONGS_TO]-(company)
      }
      WITH ${employeeMeta.nodeName}${params?.blockCompanyAndUser ? `` : `, company, currentUser`}
    `;
  }

  userHasAccess = (): string => {
    const companyId = this.clsService.get("companyId");
    const userId = this.clsService.get("userId");

    return `
      WITH ${employeeMeta.nodeName}${companyId ? `, ${companyMeta.nodeName}` : ``}${userId ? `, currentUser` : ``}
    `;
  };

  returnStatement = () => {
    return `
      MATCH (${employeeMeta.nodeName}:${employeeMeta.labelName})-[:BELONGS_TO]->(${employeeMeta.nodeName}_${companyMeta.nodeName}:${companyMeta.labelName})
      RETURN ${employeeMeta.nodeName},
        ${employeeMeta.nodeName}_${companyMeta.nodeName}
    `;
  };
}