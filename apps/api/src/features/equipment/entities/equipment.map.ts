import { mapEntity } from "src/common/abstracts/entity";
import { EntityFactory } from "src/core/neo4j/factories/entity.factory";
import { Equipment } from "src/features/equipment/entities/equipment.entity";

export const mapEquipment = (params: { data: any; record: any; entityFactory: EntityFactory }): Equipment => {
  return {
    ...mapEntity({ record: params.data }),
    name: params.data.name,
    barcode: params.data.barcode,
    description: params.data.description,
    startDate: params.data.startDate ? new Date(params.data.startDate) : undefined,
    endDate: params.data.endDate ? new Date(params.data.endDate) : undefined,
    manufacturer: params.data.manufacturer,
    model: params.data.model,
    category: params.data.category,
    imageUrl: params.data.imageUrl,
    status: params.data.status,
    company: undefined,
    supplier: undefined,
    loan: undefined,
  };
};
