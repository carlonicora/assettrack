import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";
import { LoanInput, LoanInterface } from "@/features/features/loan/data/LoanInterface";

export class Loan extends AbstractApiData implements LoanInterface {
  private _name?: string;
  private _startDate?: Date;
  private _endDate?: Date;

  private _employee?: EmployeeInterface;
  private _equipment?: EquipmentInterface;

  get name(): string {
    if (this._name === undefined) throw new Error("JsonApi error: loan name is missing");
    return this._name;
  }

  get startDate(): Date {
    if (this._startDate === undefined) throw new Error("JsonApi error: loan startDate is missing");
    return this._startDate;
  }

  get endDate(): Date {
    if (this._endDate === undefined) throw new Error("JsonApi error: loan endDate is missing");
    return this._endDate;
  }

  get employee(): EmployeeInterface {
    if (this._employee === undefined) throw new Error("JsonApi error: loan employee is missing");
    return this._employee;
  }

  get equipment(): EquipmentInterface {
    if (this._equipment === undefined) throw new Error("JsonApi error: loan equipment is missing");
    return this._equipment;
  }


  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._name = data.jsonApi.attributes.name;
    this._startDate = data.jsonApi.attributes.startDate ? new Date(data.jsonApi.attributes.startDate) : undefined;
    this._endDate = data.jsonApi.attributes.endDate ? new Date(data.jsonApi.attributes.endDate) : undefined;

    this._employee = this._readIncluded(data, "employee", Modules.Employee) as EmployeeInterface;
    this._equipment = this._readIncluded(data, "equipment", Modules.Equipment) as EquipmentInterface;

    return this;
  }

  createJsonApi(data: LoanInput) {
    const response: any = {
      data: {
        type: Modules.Loan.name,
        id: data.id,
        attributes: {},
        meta: {},
        relationships: {},
      },
      included: [],
    };

    if (data.name !== undefined) response.data.attributes.name = data.name;
    if (data.startDate !== undefined) response.data.attributes.startDate = data.startDate;
    if (data.endDate !== undefined) response.data.attributes.endDate = data.endDate;

    if (data.employeeId) {
      response.data.relationships.employee = {
        data: {
          type: Modules.Employee.name,
          id: data.employeeId,
        },
      };
    }

    if (data.equipmentId) {
      response.data.relationships.equipment = {
        data: {
          type: Modules.Equipment.name,
          id: data.equipmentId,
        },
      };
    }

    return response;
  }
}
