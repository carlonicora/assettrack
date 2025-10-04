import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";

export type EquipmentInput = {
  id: string;
  name?: string;
  barcode?: string | undefined | null;
  description?: string | undefined | null;
  startDate?: Date;
  endDate?: Date;

  supplierId: string;
};

export interface EquipmentInterface extends ApiDataInterface {
  get name(): string;
  get barcode(): string | undefined;
  get description(): string | undefined;
  get startDate(): Date;
  get endDate(): Date;

  get supplier(): SupplierInterface;
}
