import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { FeatureModel } from "src/foundations/feature/entities/feature.model";
import { roleMeta } from "src/foundations/role/entities/role.meta";

@Injectable()
export class RoleSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return roleMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      description: "description",
      isSelectable: "isSelectable",
    };

    this.relationships = {
      feature: {
        name: `requiredFeature`,
        data: this.serialiserFactory.create(FeatureModel),
      },
    };

    return super.create();
  }
}
