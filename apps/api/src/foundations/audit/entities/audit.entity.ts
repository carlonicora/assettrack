import { Entity } from "src/common/abstracts/entity";
import { User } from "src/foundations/user/entities/user.entity";

export type Audit = Entity & {
  auditType: string;

  user: User;
  audited?: any;
};
