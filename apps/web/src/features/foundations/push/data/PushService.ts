import { AbstractService, HttpMethod } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { Modules } from "@/modules/modules";

export class PushService extends AbstractService {

  static async register(params: { data: any }): Promise<void> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Push });

    await this.callApi({
      type: Modules.Push,
      method: HttpMethod.POST,
      endpoint: endpoint.generate(),
      input: params.data,
      overridesJsonApiCreation: true,
    });
  }
}
