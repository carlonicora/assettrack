import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Analytic } from "src/features/analytic/entities/analytic.entity";

export const mapAnalytic = (params: { data: any; record: any; entityFactory: EntityFactory }): Analytic => {
  return {
    ...mapEntity({ record: params.data }),
    equipment: params.data.equipment,
    loan: params.data.loan,
    expiring30: params.data.expiring30,
    expiring60: params.data.expiring60,
    expiring90: params.data.expiring90,
    expired: params.data.expired,
    company: undefined,
  };
};
