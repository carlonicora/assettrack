import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BaseConfigInterface } from "src/common/config/interfaces/base.config.interface";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { DynamicRelationshipFactory } from "src/core/jsonapi/factories/dynamic.relationship.factory";
import { JsonApiSerialiserFactory } from "src/core/jsonapi/factories/jsonapi.serialiser.factory";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { auditMeta } from "src/foundations/audit/entities/audit.meta";
import { UserModel } from "src/foundations/user/entities/user.model";

@Injectable()
export class AuditSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  constructor(
    protected readonly serialiserFactory: JsonApiSerialiserFactory,
    config: ConfigService<BaseConfigInterface>,
    private readonly dynamicRelationshipFactory: DynamicRelationshipFactory,
  ) {
    super(serialiserFactory, config);
  }

  get type(): string {
    return auditMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      auditType: "auditType",
    };

    const dynamicRel = this.dynamicRelationshipFactory.createDynamicRelationship(null);

    this.relationships = {
      user: {
        data: this.serialiserFactory.create(UserModel),
      },
      audited: {
        data: dynamicRel,
        dynamicFactory: this.dynamicRelationshipFactory,
      },
    };

    return super.create();
  }
}
