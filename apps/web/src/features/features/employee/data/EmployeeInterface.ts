import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type EmployeeInput = {
  id: string;
  name?: string;
  phone?: string | undefined | null;
  email?: string | undefined | null;
  avatar?: string | undefined | null;
};

export interface EmployeeInterface extends ApiDataInterface {
  get name(): string;
  get phone(): string | undefined;
  get email(): string | undefined;
  get avatar(): string | undefined;
}
