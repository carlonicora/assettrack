import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsBoolean, IsDateString } from "class-validator";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";

export class SupplierPostAttributesDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}


export class SupplierPostDataDTO {
  @Equals(SupplierModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => SupplierPostAttributesDTO)
  attributes: SupplierPostAttributesDTO;
}

export class SupplierPostDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => SupplierPostDataDTO)
  data: SupplierPostDataDTO;
}