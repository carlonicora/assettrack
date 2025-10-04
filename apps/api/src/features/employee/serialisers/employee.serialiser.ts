import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { EmployeeModel } from "src/features/employee/entities/employee.model";

@Injectable()
export class EmployeeSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return EmployeeModel.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      phone: "phone",
      email: "email",
      avatar: "avatar",
    };

    return super.create();
  }
}
