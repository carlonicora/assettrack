import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Equipment } from "src/features/equipment/entities/equipment.entity";
import { mapEquipment } from "src/features/equipment/entities/equipment.map";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { EquipmentSerialiser } from "src/features/equipment/serialisers/equipment.serialiser";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { companyMeta } from "src/foundations/company/entities/company.meta";

export const EquipmentModel: DataModelInterface<Equipment> = {
  ...equipmentMeta,
  entity: undefined as unknown as Equipment,
  mapper: mapEquipment,
  serialiser: EquipmentSerialiser,
  singleChildrenTokens: [companyMeta.nodeName,supplierMeta.nodeName, ],
  childrenTokens: []
};