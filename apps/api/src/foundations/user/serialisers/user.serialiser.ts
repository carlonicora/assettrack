import { User } from "src/foundations/user/entities/user.entity";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigInterface } from "src/config/interfaces/config.interface";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiSerialiserFactory } from "src/core/jsonapi/factories/jsonapi.serialiser.factory";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { CompanyModel } from "src/foundations/company/entities/company.model";
import { ModuleModel } from "src/foundations/module/entities/module.model";
import { RoleModel } from "src/foundations/role/entities/role.model";
import { S3Service } from "src/foundations/s3/services/s3.service";
import { userMeta } from "src/foundations/user/entities/user.meta";

@Injectable()
export class UserSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  constructor(
    serialiserFactory: JsonApiSerialiserFactory,
    config: ConfigService<ConfigInterface>,
    private readonly s3Service: S3Service,
  ) {
    super(serialiserFactory, config);
  }

  get type(): string {
    return userMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      username: "username",
      name: "name",
      title: "title",
      bio: "bio",
      email: "email",
      avatar: async (data: User) => {
        if (!data.avatar) return undefined;
        if (data.avatar.startsWith("~")) return data.avatar.substring(1);
        return await this.s3Service.generateSignedUrl({ key: data.avatar, isPublic: true });
      },
      avatarUrl: (data: User) => {
        if (!data.avatar) return undefined;
        return data.avatar;
      },
      phone: "phone",
      rate: "rate",
    };

    this.meta = {
      isActive: "isActive",
      isDeleted: "isDeleted",
      lastLogin: "lastLogin",
    };

    this.relationships = {
      role: {
        name: `roles`,
        data: this.serialiserFactory.create(RoleModel),
      },
      company: {
        data: this.serialiserFactory.create(CompanyModel),
      },
      module: {
        name: `modules`,
        data: this.serialiserFactory.create(ModuleModel),
      },
    };

    return super.create();
  }
}
