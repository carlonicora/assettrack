import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Loan } from "src/features/loan/entities/loan.entity";

export const mapLoan = (params: { data: any; record: any; entityFactory: EntityFactory }): Loan => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    startDate: params.data.startDate ? new Date(params.data.startDate) : undefined,
    endDate: params.data.endDate ? new Date(params.data.endDate) : undefined,
    company: undefined,
    employee: undefined,
    equipment: undefined,
  };
};
