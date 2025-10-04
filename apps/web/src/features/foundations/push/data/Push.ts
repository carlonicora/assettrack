import { PushInput, PushInterface } from "@/features/foundations/push/data/PushInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { Modules } from "@/modules/modules";

export class Push extends AbstractApiData implements PushInterface {
  createJsonApi(data: PushInput) {
    const response: any = {
      data: {
        type: Modules.Push.name,
        attributes: {
          key: data.key,
        },
      },
      included: [],
    };

    return response;
  }
}
