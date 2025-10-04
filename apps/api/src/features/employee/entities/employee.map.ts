import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Employee } from "src/features/employee/entities/employee.entity";

export const mapEmployee = (params: { data: any; record: any; entityFactory: EntityFactory }): Employee => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    phone: params.data.phone,
    email: params.data.email,
    avatar: params.data.avatar,
    company: undefined,
  };
};
