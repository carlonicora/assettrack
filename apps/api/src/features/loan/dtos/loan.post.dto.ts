import { Type } from "class-transformer";
import { Equals, IsDateString, IsDefined, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { EmployeeDataDTO } from "src/features/employee/dtos/employee.dto";
import { EquipmentDataDTO } from "src/features/equipment/dtos/equipment.dto";
import { LoanModel } from "src/features/loan/entities/loan.model";

export class LoanPostAttributesDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
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
