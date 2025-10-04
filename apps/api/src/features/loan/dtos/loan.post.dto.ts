import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsBoolean, IsDateString } from "class-validator";
import { LoanModel } from "src/features/loan/entities/loan.model";
import { EmployeeDataDTO } from "src/features/employee/dtos/employee.dto";
import { EquipmentDataDTO } from "src/features/equipment/dtos/equipment.dto";

export class LoanPostAttributesDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}

export class LoanPostRelationshipsDTO {
  @ValidateNested()
  @IsDefined()
  @Type(() => EmployeeDataDTO)
  employee: EmployeeDataDTO;

  @ValidateNested()
  @IsDefined()
  @Type(() => EquipmentDataDTO)
  equipment: EquipmentDataDTO;
}

export class LoanPostDataDTO {
  @Equals(LoanModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => LoanPostAttributesDTO)
  attributes: LoanPostAttributesDTO;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => LoanPostRelationshipsDTO)
  relationships: LoanPostRelationshipsDTO;
}

export class LoanPostDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => LoanPostDataDTO)
  data: LoanPostDataDTO;
}