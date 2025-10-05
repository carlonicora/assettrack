import { Type } from "class-transformer";
import { Equals, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { AnalyticModel } from "src/features/analytic/entities/analytic.model";

export class AnalyticDTO {
  @Equals(AnalyticModel.endpoint)
  type: string;

  @IsUUID()
  id: string;
}

export class AnalyticDataDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => AnalyticDTO)
  data: AnalyticDTO;
}

export class AnalyticDataListDTO {
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => AnalyticDTO)
  data: AnalyticDTO[];
}
