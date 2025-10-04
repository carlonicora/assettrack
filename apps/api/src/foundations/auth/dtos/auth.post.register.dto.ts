import { Type } from "class-transformer";
import { Equals, IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { authMeta } from "src/foundations/auth/entities/auth.meta";

export class AuthPostRegisterAttributesDTO {
  @IsDefined()
  @IsString()
  companyName: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  password: string;

  @IsDefined()
  @IsString()
  partitaIva: string;

  @IsOptional()
  @IsString()
  codiceFiscale: string;
}

export class AuthPostRegisterDataDTO {
  @Equals(authMeta.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => AuthPostRegisterAttributesDTO)
  attributes: AuthPostRegisterAttributesDTO;
}

export class AuthPostRegisterDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => AuthPostRegisterDataDTO)
  data: AuthPostRegisterDataDTO;
}
