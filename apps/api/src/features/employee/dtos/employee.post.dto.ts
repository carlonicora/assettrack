import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { EmployeeModel } from "src/features/employee/entities/employee.model";

export class EmployeePostAttributesDTO {
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

export class EmployeePostDataDTO {
  @Equals(EmployeeModel.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => EmployeePostAttributesDTO)
  attributes: EmployeePostAttributesDTO;
}

export class EmployeePostDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EmployeePostDataDTO)
  data: EmployeePostDataDTO;
}
