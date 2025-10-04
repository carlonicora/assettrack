import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { EquipmentModel } from "src/features/equipment/entities/equipment.model";

export class EquipmentDTO {
  @Equals(EquipmentModel.endpoint)
  type: string;

  @IsUUID()
  id: string;
}

export class EquipmentDataDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EquipmentDTO)
  data: EquipmentDTO;
}

export class EquipmentDataListDTO {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => EquipmentDTO)
  data: EquipmentDTO[];
}
