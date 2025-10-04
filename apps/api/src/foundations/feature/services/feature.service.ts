import { Injectable } from "@nestjs/common";

import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiPaginator } from "src/core/jsonapi/serialisers/jsonapi.paginator";
import { JsonApiService } from "src/core/jsonapi/services/jsonapi.service";
import { FeatureModel } from "src/foundations/feature/entities/feature.model";
import { FeatureRepository } from "../repositories/feature.repository";

@Injectable()
export class FeatureService {
  constructor(
    private readonly builder: JsonApiService,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async find(params: { term?: string; query: any }): Promise<JsonApiDataInterface> {
    const paginator: JsonApiPaginator = new JsonApiPaginator(params.query);

    return this.builder.buildList(
      FeatureModel,
      await this.featureRepository.find({
        term: params.term,
        cursor: paginator.generateCursor(),
      }),
      paginator,
    );
  }

  async findByCompany(params: { companyId: string }): Promise<JsonApiDataInterface> {
    return this.builder.buildList(
      FeatureModel,
      await this.featureRepository.findByCompany({
        companyId: params.companyId,
      }),
    );
  }
}
