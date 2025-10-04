import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { EmployeeModel } from "src/features/employee/entities/employee.model";

export class EmployeePutAttributesDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class EmployeePutDataDTO {
  @Equals(EmployeeModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EmployeePutAttributesDTO)
  attributes: EmployeePutAttributesDTO;
}

export class EmployeePutDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EmployeePutDataDTO)
  data: EmployeePutDataDTO;
}
