import { Entity } from "src/common/abstracts/entity";
import { Auth } from "src/foundations/auth/entities/auth.entity";

export type AuthCode = Entity & {
  expiration: Date;

  auth?: Auth;
};
