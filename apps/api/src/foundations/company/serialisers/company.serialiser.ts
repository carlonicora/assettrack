import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigInterface } from "src/config/interfaces/config.interface";
import { AbstractJsonApiSerialiser } from "src/core/jsonapi/abstracts/abstract.jsonapi.serialiser";
import { JsonApiSerialiserFactory } from "src/core/jsonapi/factories/jsonapi.serialiser.factory";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiServiceInterface } from "src/core/jsonapi/interfaces/jsonapi.service.interface";
import { Company } from "src/foundations/company/entities/company.entity";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { FeatureModel } from "src/foundations/feature/entities/feature.model";
import { ModuleModel } from "src/foundations/module/entities/module.model";
import { S3Service } from "src/foundations/s3/services/s3.service";

@Injectable()
export class CompanySerialiser extends AbstractJsonApiSerialiser implements JsonApiServiceInterface {
  constructor(
    serialiserFactory: JsonApiSerialiserFactory,
    config: ConfigService<ConfigInterface>,
    protected readonly s3Service: S3Service,
  ) {
    super(serialiserFactory, config);
  }

  get type(): string {
    return companyMeta.endpoint;
  }

  create(): JsonApiDataInterface {
    this.attributes = {
      name: "name",
      logoUrl: "logo",
      logo: async (data: Company) => {
        if (!data.logo) return undefined;

        return await this.s3Service.generateSignedUrl({ key: data.logo, isPublic: true });
      },
      availableTokens: async (data: Company) => {
        if (data.availableTokens === undefined) return 0;
        return Number(data.availableTokens);
      },
      licenseExpirationDate: (data: Company) => data.licenseExpirationDate?.toISOString(),
    };

    this.relationships = {
      feature: {
        name: `features`,
        data: this.serialiserFactory.create(FeatureModel),
      },
      module: {
        name: `modules`,
        data: this.serialiserFactory.create(ModuleModel),
      },
    };

    return super.create();
  }
}
