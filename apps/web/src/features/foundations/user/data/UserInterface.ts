import { CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { ModuleInterface } from "@/features/foundations/module/data/ModuleInterface";
import { RoleInterface } from "@/features/foundations/role/data/RoleInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type UserInput = {
  id: string;
  email?: string | undefined | null;
  name?: string;
  title?: string;
  bio?: string;
  password?: string | undefined;
  roleIds?: string[];
  sendInvitationEmail?: boolean;
  companyId?: string;
  adminCreated?: boolean;
  avatar?: string;
  phone?: string;
  rate?: number;
};

export interface UserInterface extends ApiDataInterface {
  get email(): string;
  get name(): string;
  get title(): string;
  get bio(): string;
  get avatar(): string | undefined;
  get avatarUrl(): string | undefined;
  get phone(): string | undefined;
  get rate(): number | undefined;

  get isActivated(): boolean;
  get isDeleted(): boolean;
  get lastLogin(): Date | undefined;

  get roles(): RoleInterface[];
  get company(): CompanyInterface | undefined;
  get modules(): ModuleInterface[];
}
