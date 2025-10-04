import { authMeta } from "src/foundations/auth/entities/auth.meta";
import { ResourceValidator } from "../JsonApiValidator";
import { standardMeta } from "./common";

export const authValidator: ResourceValidator = {
  type: authMeta.type,
  attributes: {
    token: {
      required: true,
    },
    refreshToken: {
      required: true,
    },
  },
  meta: {
    ...standardMeta,
  },
  relationships: {},
};
