import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsBoolean, IsDateString, IsDefined } from "class-validator";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";

export class SupplierPutAttributesDTO {
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



export class SupplierPutDataDTO {
  @Equals(SupplierModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => SupplierPutAttributesDTO)
  attributes: SupplierPutAttributesDTO;
}

export class SupplierPutDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => SupplierPutDataDTO)
  data: SupplierPutDataDTO;
}