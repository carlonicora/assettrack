import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { moduleMeta } from "src/foundations/module/entities/module.meta";

@Injectable()
export class ModuleSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return moduleMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      isCore: "isCore",
    };

    this.meta = {
      permissions: {
        create: "create",
        read: "read",
        update: "update",
        delete: "delete",
      },
    };

    return super.create();
  }
}
