import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { AnalyticModel } from "src/features/analytic/entities/analytic.model";

@Injectable()
export class AnalyticSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return AnalyticModel.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      equipment: "equipment",
      loan: "loan",
      expiring30: "expiring30",
      expiring60: "expiring60",
      expiring90: "expiring90",
      expired: "expired",
    };

    return super.create();
  }
}
