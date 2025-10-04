import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";
import { SupplierInput, SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";

export class Supplier extends AbstractApiData implements SupplierInterface {
  private _name?: string;
  private _address?: string;
  private _email?: string;
  private _phone?: string;

  get name(): string {
    if (this._name === undefined) throw new Error("JsonApi error: supplier name is missing");
    return this._name;
  }

  get address(): string | undefined {
    return this._address;
  }

  get email(): string | undefined {
    return this._email;
  }

  get phone(): string | undefined {
    return this._phone;
  }


  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._name = data.jsonApi.attributes.name;
    this._address = data.jsonApi.attributes.address;
    this._email = data.jsonApi.attributes.email;
    this._phone = data.jsonApi.attributes.phone;

    return this;
  }

  createJsonApi(data: SupplierInput) {
    const response: any = {
      data: {
        type: Modules.Supplier.name,
        id: data.id,
        attributes: {},
        meta: {},
        relationships: {},
      },
      included: [],
    };

    if (data.name !== undefined) response.data.attributes.name = data.name;
    if (data.address !== undefined) response.data.attributes.address = data.address;
    if (data.email !== undefined) response.data.attributes.email = data.email;
    if (data.phone !== undefined) response.data.attributes.phone = data.phone;
    return response;
  }
}
