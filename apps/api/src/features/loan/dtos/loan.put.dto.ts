import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsBoolean, IsDateString, IsDefined } from "class-validator";
import { LoanModel } from "src/features/loan/entities/loan.model";
import { EmployeeDataDTO } from "src/features/employee/dtos/employee.dto";
import { EquipmentDataDTO } from "src/features/equipment/dtos/equipment.dto";

export class LoanPutAttributesDTO {
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

export class LoanPutRelationshipsDTO {
  @ValidateNested()
  @IsDefined()
  @Type(() => EmployeeDataDTO)
  employee: EmployeeDataDTO;

  @ValidateNested()
  @IsDefined()
  @Type(() => EquipmentDataDTO)
  equipment: EquipmentDataDTO;
}


export class LoanPutDataDTO {
  @Equals(LoanModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => LoanPutAttributesDTO)
  attributes: LoanPutAttributesDTO;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => LoanPutRelationshipsDTO)
  relationships: LoanPutRelationshipsDTO;
}

export class LoanPutDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => LoanPutDataDTO)
  data: LoanPutDataDTO;
}