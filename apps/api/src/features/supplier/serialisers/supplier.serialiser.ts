import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";

@Injectable()
export class SupplierSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return SupplierModel.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      address: "address",
      email: "email",
      phone: "phone",
    };


    return super.create();
  }
}