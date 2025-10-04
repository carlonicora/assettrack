import { Type } from "class-transformer";
import { Equals, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { RoleDataListDTO } from "src/foundations/role/dtos/role.dto";
import { userMeta } from "src/foundations/user/entities/user.meta";

export class UserPutAttributesDTO {
  @IsDefined()
  @IsString()
  email: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UserPutRelationshipsDTO {
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => RoleDataListDTO)
  roles: RoleDataListDTO;
}

export class UserPutDataDTO {
  @Equals(userMeta.endpoint)
  type: string;

  @IsUUID()
  id: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => UserPutAttributesDTO)
  attributes: UserPutAttributesDTO;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => UserPutRelationshipsDTO)
  relationships: UserPutRelationshipsDTO;
}

export class UserPutDTO {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UserPutDataDTO)
  data: UserPutDataDTO;

  @IsOptional()
  included: any[];
}
