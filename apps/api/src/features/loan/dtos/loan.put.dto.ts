import { Type } from "class-transformer";
import { Equals, IsDateString, IsDefined, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { EmployeeDataDTO } from "src/features/employee/dtos/employee.dto";
import { EquipmentDataDTO } from "src/features/equipment/dtos/equipment.dto";
import { LoanModel } from "src/features/loan/entities/loan.model";

export class LoanPutAttributesDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
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
