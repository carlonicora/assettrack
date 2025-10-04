import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Supplier } from "src/features/supplier/entities/supplier.entity";

export const mapSupplier = (params: { data: any; record: any; entityFactory: EntityFactory }): Supplier => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    address: params.data.address,
    email: params.data.email,
    phone: params.data.phone,
    company: undefined,
  };
};
