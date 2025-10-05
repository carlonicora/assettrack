import { EquipmentInput, EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";

export class Equipment extends AbstractApiData implements EquipmentInterface {
  private _name?: string;
  private _barcode?: string;
  private _description?: string;
  private _startDate?: Date;
  private _endDate?: Date;
  private _manufacturer?: string;
  private _model?: string;
  private _category?: string;
  private _imageUrl?: string;
  private _status?: string;

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

  get startDate(): Date | undefined {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get status(): string {
    if (this._status === undefined) throw new Error("JsonApi error: equipment status is missing");
    return this._status;
  }
  get manufacturer(): string | undefined {
    return this._manufacturer;
  }

  get model(): string | undefined {
    return this._model;
  }

  get category(): string | undefined {
    return this._category;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
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
    this._manufacturer = data.jsonApi.attributes.manufacturer;
    this._model = data.jsonApi.attributes.model;
    this._category = data.jsonApi.attributes.category;
    this._imageUrl = data.jsonApi.attributes.imageUrl;
    this._status = data.jsonApi.attributes.status;

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
    if (data.status !== undefined) response.data.attributes.status = data.status;

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
