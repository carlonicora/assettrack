import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { FeatureDataListDTO } from "src/foundations/feature/dtos/feature.dto";
import { ModuleDataListDTO } from "src/foundations/module/dtos/module.dto";

export class CompanyPostAttributesDTO {
  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  availableTokens?: number;
}

export class CompanyPostRelationshipsDTO {
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => FeatureDataListDTO)
  features: FeatureDataListDTO;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ModuleDataListDTO)
  modules: ModuleDataListDTO;
}

export class CompanyPostDataDTO {
  @Equals(companyMeta.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => CompanyPostAttributesDTO)
  attributes: CompanyPostAttributesDTO;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CompanyPostRelationshipsDTO)
  relationships: CompanyPostRelationshipsDTO;
}

export class CompanyPostDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CompanyPostDataDTO)
  data: CompanyPostDataDTO;

  @IsOptional()
  included: any[];
}
