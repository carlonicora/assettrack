import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsBoolean, IsDateString } from "class-validator";
import { EquipmentModel } from "src/features/equipment/entities/equipment.model";
import { SupplierDataDTO } from "src/features/supplier/dtos/supplier.dto";

export class EquipmentPostAttributesDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}

export class EquipmentPostRelationshipsDTO {
  @ValidateNested()
  @IsDefined()
  @Type(() => SupplierDataDTO)
  supplier: SupplierDataDTO;
}

export class EquipmentPostDataDTO {
  @Equals(EquipmentModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => EquipmentPostAttributesDTO)
  attributes: EquipmentPostAttributesDTO;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => EquipmentPostRelationshipsDTO)
  relationships: EquipmentPostRelationshipsDTO;
}

export class EquipmentPostDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EquipmentPostDataDTO)
  data: EquipmentPostDataDTO;
}