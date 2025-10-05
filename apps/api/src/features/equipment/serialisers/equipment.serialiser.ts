import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { EquipmentModel } from "src/features/equipment/entities/equipment.model";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";

@Injectable()
export class EquipmentSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return EquipmentModel.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      barcode: "barcode",
      description: "description",
      startDate: "startDate",
      endDate: "endDate",
      manufacturer: "manufacturer",
      model: "model",
      category: "category",
      imageUrl: "imageUrl",
      status: "status",
    };

    this.relationships = {
      supplier: {
        data: this.serialiserFactory.create(SupplierModel),
      },
    };

    return super.create();
  }
}
