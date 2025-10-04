import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Audit } from "src/foundations/audit/entities/audit.entity";
import { mapAudit } from "src/foundations/audit/entities/audit.map";
import { auditMeta } from "src/foundations/audit/entities/audit.meta";
import { AuditSerialiser } from "src/foundations/audit/serialisers/audit.serialiser";
import { userMeta } from "src/foundations/user/entities/user.meta";

export const auditModel: DataModelInterface<Audit> = {
  ...auditMeta,
  entity: undefined as unknown as Audit,
  mapper: mapAudit,
  serialiser: AuditSerialiser,
  singleChildrenTokens: [userMeta.nodeName],
  // dynamicChildrenPatterns: ["{parent}_{*}"],
  dynamicSingleChildrenPatterns: ["{parent}_{*}"],
};
