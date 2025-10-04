import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type AuthInput = {
  id?: string;
  email?: string | undefined | null;
  password?: string | undefined;
  name?: string;
  companyName?: string;
  partitaIva?: string;
  codiceFiscale?: string;
};

export type AuthQuery = {
  userId?: string;

  tokenCode?: string;
  refreshToken?: string;

  login?: boolean;
  forgot?: boolean;
  code?: string;
  activationCode?: string;
  checkUsername?: string;
};

export interface AuthInterface extends ApiDataInterface {
  get token(): string;
  get refreshToken(): string;
  get user(): UserInterface;
}
