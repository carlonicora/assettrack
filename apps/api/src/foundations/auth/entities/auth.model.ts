import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Auth } from "src/foundations/auth/entities/auth.entity";
import { mapAuth } from "src/foundations/auth/entities/auth.map";
import { authMeta } from "src/foundations/auth/entities/auth.meta";
import { AuthSerialiser } from "src/foundations/auth/serialisers/auth.serialiser";
import { userMeta } from "src/foundations/user/entities/user.meta";

export const AuthModel: DataModelInterface<Auth> = {
  ...authMeta,
  entity: undefined as unknown as Auth,
  mapper: mapAuth,
  serialiser: AuthSerialiser,
  singleChildrenTokens: [userMeta.nodeName],
};
