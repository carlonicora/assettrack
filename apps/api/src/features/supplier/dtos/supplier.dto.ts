import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";

export class SupplierDTO {
  @Equals(SupplierModel.endpoint)
  type: string;

  @IsUUID()
  id: string;
}

export class SupplierDataDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => SupplierDTO)
  data: SupplierDTO;
}

export class SupplierDataListDTO {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => SupplierDTO)
  data: SupplierDTO[];
}