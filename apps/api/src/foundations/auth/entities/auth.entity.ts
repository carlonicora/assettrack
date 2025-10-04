import { Entity } from "src/common/abstracts/entity";
import { User } from "src/foundations/user/entities/user.entity";

export type Auth = Entity & {
  token: string;
  expiration: Date;
  user?: User;
};
