import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Feature } from "src/foundations/feature/entities/feature.entity";

export const mapFeature = (params: { data: any; record: any; entityFactory: EntityFactory }): Feature => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    isProduction: params.data.isProduction ?? false,
    module: [],
  };
};
