import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { ClsService } from "nestjs-cls";
import { SystemRoles } from "src/common/constants/system.role.id";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const checkPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

@Injectable()
export class SecurityService {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly clsService: ClsService,
  ) {}

  get refreshTokenExpiration(): Date {
    return new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  get tokenExpiration(): Date {
    return new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  }

  signJwt(params: { userId: string; roles: string[]; companyId: string; features: string[] }): string {
    return this.jwtService.sign({
      userId: params.userId,
      roles: params.roles.map((role) => role),
      companyId: params.companyId,
      features: params.features,
      expiration: this.tokenExpiration,
    });
  }

  validateAdmin(params: { user: any }): void {
    if (
      !this.isUserInRoles({
        user: params.user,
        roles: [SystemRoles.Administrator, SystemRoles.CompanyAdministrator],
      })
    )
      throw new Error("User is not an admin");
  }

  isUserInRoles(params: { user: any; roles: string[] }): boolean {
    if (!params.user || !params.user.roles) return false;
    return params.roles.some((role: string) => params.user.roles.includes(role));
  }

  userHasAccess(params: { validator: (params?: any) => string }): string {
    return params.validator();
  }
}
