import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { LoanModel } from "src/features/loan/entities/loan.model";
import { EmployeeModel } from "src/features/employee/entities/employee.model";
import { EquipmentModel } from "src/features/equipment/entities/equipment.model";

@Injectable()
export class LoanSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return LoanModel.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      startDate: "startDate",
      endDate: "endDate",
    };

    this.relationships = {
      employee: {
        
        data: this.serialiserFactory.create(EmployeeModel),
      },
      equipment: {
        
        data: this.serialiserFactory.create(EquipmentModel),
      }
    };

    return super.create();
  }
}