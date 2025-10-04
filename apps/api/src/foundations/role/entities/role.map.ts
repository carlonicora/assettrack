import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Role } from "src/foundations/role/entities/role.entity";

export const mapRole = (params: { data: any; record: any; entityFactory: EntityFactory }): Role => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    description: params.data.description,
    isSelectable: params.data.isSelectable,
    requiredFeature: undefined,
  };
};
