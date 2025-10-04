import { Injectable } from "@nestjs/common";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { notificationMeta } from "src/foundations/notification/entities/notification.meta";
import { UserModel } from "src/foundations/user/entities/user.model";

@Injectable()
export class NotificationSerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  get type(): string {
    return notificationMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      notificationType: "notificationType",
      isRead: "isRead",
    };

    this.relationships = {
      user: {
        name: `actor`,
        data: this.serialiserFactory.create(UserModel),
      },
    };

    return super.create();
  }
}
