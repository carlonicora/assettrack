import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { LoanModel } from "src/features/loan/entities/loan.model";

export class LoanDTO {
  @Equals(LoanModel.endpoint)
  type: string;

  @IsUUID()
  id: string;
}

export class LoanDataDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => LoanDTO)
  data: LoanDTO;
}

export class LoanDataListDTO {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => LoanDTO)
  data: LoanDTO[];
}