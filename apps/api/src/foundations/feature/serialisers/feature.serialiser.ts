import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { ModuleModel } from "src/foundations/module/entities/module.model";

@Injectable()
export class FeatureSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return featureMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      isProduction: "isProduction",
    };

    this.relationships = {
      module: {
        name: `modules`,
        data: this.serialiserFactory.create(ModuleModel),
      },
    };

    return super.create();
  }
}
