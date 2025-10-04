import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type SupplierInput = {
  id: string;
  name?: string;
  address?: string | undefined | null;
  email?: string | undefined | null;
  phone?: string | undefined | null;
};

export interface SupplierInterface extends ApiDataInterface {
  get name(): string;
  get address(): string | undefined;
  get email(): string | undefined;
  get phone(): string | undefined;
}
