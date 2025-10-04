import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";
import { EquipmentInput, EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";

export class Equipment extends AbstractApiData implements EquipmentInterface {
  private _name?: string;
  private _barcode?: string;
  private _description?: string;
  private _startDate?: Date;
  private _endDate?: Date;

  private _supplier?: SupplierInterface;

  get name(): string {
    if (this._name === undefined) throw new Error("JsonApi error: equipment name is missing");
    return this._name;
  }

  get barcode(): string | undefined {
    return this._barcode;
  }

  get description(): string | undefined {
    return this._description;
  }

  get startDate(): Date {
    if (this._startDate === undefined) throw new Error("JsonApi error: equipment startDate is missing");
    return this._startDate;
  }

  get endDate(): Date {
    if (this._endDate === undefined) throw new Error("JsonApi error: equipment endDate is missing");
    return this._endDate;
  }

  get supplier(): SupplierInterface {
    if (this._supplier === undefined) throw new Error("JsonApi error: equipment supplier is missing");
    return this._supplier;
  }


  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._name = data.jsonApi.attributes.name;
    this._barcode = data.jsonApi.attributes.barcode;
    this._description = data.jsonApi.attributes.description;
    this._startDate = data.jsonApi.attributes.startDate ? new Date(data.jsonApi.attributes.startDate) : undefined;
    this._endDate = data.jsonApi.attributes.endDate ? new Date(data.jsonApi.attributes.endDate) : undefined;

    this._supplier = this._readIncluded(data, "supplier", Modules.Supplier) as SupplierInterface;

    return this;
  }

  createJsonApi(data: EquipmentInput) {
    const response: any = {
      data: {
        type: Modules.Equipment.name,
        id: data.id,
        attributes: {},
        meta: {},
        relationships: {},
      },
      included: [],
    };

    if (data.name !== undefined) response.data.attributes.name = data.name;
    if (data.barcode !== undefined) response.data.attributes.barcode = data.barcode;
    if (data.description !== undefined) response.data.attributes.description = data.description;
    if (data.startDate !== undefined) response.data.attributes.startDate = data.startDate;
    if (data.endDate !== undefined) response.data.attributes.endDate = data.endDate;

    if (data.supplierId) {
      response.data.relationships.supplier = {
        data: {
          type: Modules.Supplier.name,
          id: data.supplierId,
        },
      };
    }

    return response;
  }
}
