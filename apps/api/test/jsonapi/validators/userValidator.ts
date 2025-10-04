import { companyMeta } from "src/foundations/company/entities/company.meta";
import { moduleMeta } from "src/foundations/module/entities/module.meta";
import { roleMeta } from "src/foundations/role/entities/role.meta";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { ResourceValidator } from "../JsonApiValidator";
import { standardMeta } from "./common";

export const userValidator: ResourceValidator = {
  type: userMeta.type,
  attributes: {
    email: {
      required: true,
    },
    name: {
      required: true,
    },
    title: {},
    bio: {},
    phone: {},
    avatar: {},
    avatarUrl: {},
  },
  meta: {
    ...standardMeta,
    isActive: {
      required: true,
      type: "boolean",
    },
    isDeleted: {
      required: true,
      type: "boolean",
    },
    lastLogin: {
      type: "date",
    },
  },
  relationships: {
    company: {
      type: companyMeta.type,
    },
    roles: {
      type: roleMeta.type,
      isArray: true,
    },
    modules: {
      type: moduleMeta.type,
      isArray: true,
    },
  },
};
