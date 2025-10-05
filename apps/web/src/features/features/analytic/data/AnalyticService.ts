import { AbstractService, HttpMethod } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { AnalyticInterface } from "@/features/features/analytic/data/AnalyticInterface";
import { Modules } from "@/modules/modules";

export class AnalyticService extends AbstractService {
  static async find(): Promise<AnalyticInterface> {
    return this.callApi<AnalyticInterface>({
      type: Modules.Analytic,
      method: HttpMethod.GET,
      endpoint: new EndpointCreator({ endpoint: Modules.Analytic }).generate(),
    });
  }
}
