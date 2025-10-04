import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";
import { EmployeeInput, EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";

export class Employee extends AbstractApiData implements EmployeeInterface {
  private _name?: string;
  private _phone?: string;
  private _email?: string;
  private _avatar?: string;

  get name(): string {
    if (this._name === undefined) throw new Error("JsonApi error: employee name is missing");
    return this._name;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get email(): string | undefined {
    return this._email;
  }

  get avatar(): string | undefined {
    return this._avatar;
  }


  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._name = data.jsonApi.attributes.name;
    this._phone = data.jsonApi.attributes.phone;
    this._email = data.jsonApi.attributes.email;
    this._avatar = data.jsonApi.attributes.avatar;

    return this;
  }

  createJsonApi(data: EmployeeInput) {
    const response: any = {
      data: {
        type: Modules.Employee.name,
        id: data.id,
        attributes: {},
        meta: {},
        relationships: {},
      },
      included: [],
    };

    if (data.name !== undefined) response.data.attributes.name = data.name;
    if (data.phone !== undefined) response.data.attributes.phone = data.phone;
    if (data.email !== undefined) response.data.attributes.email = data.email;
    if (data.avatar !== undefined) response.data.attributes.avatar = data.avatar;
    return response;
  }
}
