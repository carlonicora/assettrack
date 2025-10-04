import {
  NotificationInput,
  NotificationInterface,
} from "@/features/foundations/notification/data/NotificationInterface";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";

export class Notification extends AbstractApiData implements NotificationInterface {
  private _notificationType?: string;
  private _isRead?: boolean;

  private _actor?: UserInterface;

  get notificationType(): string {
    if (this._notificationType === undefined) throw new Error("notificationType is not set");
    return this._notificationType;
  }

  get isRead(): boolean {
    return this._isRead === undefined ? false : this._isRead;
  }

  get actor(): UserInterface | undefined {
    return this._actor;
  }

  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._notificationType = data.jsonApi.attributes.notificationType;
    this._isRead = data.jsonApi.attributes.isRead;

    this._actor = this._readIncluded(data, "actor", Modules.User) as UserInterface;

    return this;
  }

  createJsonApi(data: NotificationInput) {
    const response: any = {
      data: {
        type: Modules.Notification.name,
        id: data.id,
        attributes: {
          isRead: data.isRead,
        },
        meta: {},
        relationships: {},
      },
      included: [],
    };

    return response;
  }
}
