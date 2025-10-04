import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { EmployeeModel } from "src/features/employee/entities/employee.model";

export class EmployeeDTO {
  @Equals(EmployeeModel.endpoint)
  type: string;

  @IsUUID()
  id: string;
}

export class EmployeeDataDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EmployeeDTO)
  data: EmployeeDTO;
}

export class EmployeeDataListDTO {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => EmployeeDTO)
  data: EmployeeDTO[];
}