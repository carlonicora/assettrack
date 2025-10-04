import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Audit } from "src/foundations/audit/entities/audit.entity";

export const mapAudit = (params: { data: any; record: any; entityFactory: EntityFactory }): Audit => {
  return {
    ...mapEntity({ record: params.data }),
    auditType: params.data.auditType,

    user: undefined,
    // audited: [],
    audited: undefined,
  };
};
