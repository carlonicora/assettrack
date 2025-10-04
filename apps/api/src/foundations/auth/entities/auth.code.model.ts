import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { AuthCode } from "src/foundations/auth/entities/auth.code.entity";
import { mapAuthCode } from "src/foundations/auth/entities/auth.code.map";
import { authCodeMeta } from "src/foundations/auth/entities/auth.code.meta";
import { authMeta } from "src/foundations/auth/entities/auth.meta";

export const AuthCodeModel: DataModelInterface<AuthCode> = {
  ...authCodeMeta,
  entity: undefined as unknown as AuthCode,
  mapper: mapAuthCode,
  singleChildrenTokens: [authMeta.nodeName],
};
