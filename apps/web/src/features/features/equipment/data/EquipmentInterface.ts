import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type EquipmentInput = {
  id: string;
  name?: string;
  barcode?: string | undefined | null;
  description?: string | undefined | null;
  startDate?: Date;
  endDate?: Date;
  status: string;

  supplierId: string;
};

export interface EquipmentInterface extends ApiDataInterface {
  get name(): string;
  get barcode(): string | undefined;
  get description(): string | undefined;
  get startDate(): Date | undefined;
  get endDate(): Date | undefined;
  get manufacturer(): string | undefined;
  get model(): string | undefined;
  get category(): string | undefined;
  get imageUrl(): string | undefined;
  get status(): string;

  get supplier(): SupplierInterface;
}
