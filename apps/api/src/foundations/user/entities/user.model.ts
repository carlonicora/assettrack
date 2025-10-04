import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { moduleMeta } from "src/foundations/module/entities/module.meta";
import { roleMeta } from "src/foundations/role/entities/role.meta";
import { User } from "src/foundations/user/entities/user.entity";
import { mapUser } from "src/foundations/user/entities/user.map";
import { ownerMeta, userMeta } from "src/foundations/user/entities/user.meta";
import { UserSerialiser } from "src/foundations/user/serialisers/user.serialiser";

export const UserModel: DataModelInterface<User> = {
  ...userMeta,
  entity: undefined as unknown as User,
  mapper: mapUser,
  serialiser: UserSerialiser,
  childrenTokens: [roleMeta.nodeName, moduleMeta.nodeName],
  singleChildrenTokens: [companyMeta.nodeName],
};

export const OwnerModel: DataModelInterface<User> = {
  ...UserModel,
  ...ownerMeta,
};
