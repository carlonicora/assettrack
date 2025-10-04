import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { authMeta } from "src/foundations/auth/entities/auth.meta";
import { UserModel } from "src/foundations/user/entities/user.model";

@Injectable()
export class AuthSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return authMeta.endpoint;
  }

  get endpoint(): string {
    return `${authMeta.endpoint}/refreshtoken`;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      token: "token",
      refreshToken: "refreshToken",
      expiration: "expiration",
    };

    this.relationships = {
      user: {
        data: this.serialiserFactory.create(UserModel),
      },
    };

    return super.create();
  }
}
