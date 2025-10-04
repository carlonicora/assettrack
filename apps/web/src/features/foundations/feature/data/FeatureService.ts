import { AbstractService, HttpMethod, NextRef } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { FeatureInterface } from "@/features/foundations/feature/data/FeatureInterface";
import { Modules } from "@/modules/modules";

export class FeatureService extends AbstractService {

  static async findMany(params: { companyId?: string; search?: string; next?: NextRef }): Promise<FeatureInterface[]> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Feature });

    if (params.companyId) endpoint.endpoint(Modules.Company).id(params.companyId).childEndpoint(Modules.Feature);

    if (params.search) endpoint.addAdditionalParam("search", params.search);

    return this.callApi<FeatureInterface[]>({
      type: Modules.Feature,
      method: HttpMethod.GET,
      endpoint: endpoint.generate(),
      next: params.next,
    });
  }
}
