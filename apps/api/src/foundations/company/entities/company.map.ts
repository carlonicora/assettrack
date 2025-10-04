import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Company } from "src/foundations/company/entities/company.entity";

export const mapCompany = (params: { data: any; record: any; entityFactory: EntityFactory }): Company => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    logo: params.data.logo,
    logoUrl: params.data.logoUrl,
    availableTokens: params.data.availableTokens ?? 0,

    licenseExpirationDate: params.data.licenseExpirationDate ? new Date(params.data.licenseExpirationDate) : undefined,

    feature: [],
    module: [],
  };
};
