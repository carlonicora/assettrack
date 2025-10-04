import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { Role } from "src/foundations/role/entities/role.entity";
import { mapRole } from "src/foundations/role/entities/role.map";
import { roleMeta } from "src/foundations/role/entities/role.meta";
import { RoleSerialiser } from "src/foundations/role/serialisers/role.serialiser";

export const RoleModel: DataModelInterface<Role> = {
  ...roleMeta,
  entity: undefined as unknown as Role,
  mapper: mapRole,
  serialiser: RoleSerialiser,
  singleChildrenTokens: [featureMeta.nodeName],
};
