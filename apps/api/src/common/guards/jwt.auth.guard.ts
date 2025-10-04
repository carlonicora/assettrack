import { ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ClsService } from "nestjs-cls";
import { SystemRoles } from "src/common/constants/system.role.id";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private readonly cls: ClsService,
    private reflector: Reflector,
    private readonly neo4j: Neo4jService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) return false;

    const isAuthenticated = (await super.canActivate(context)) as boolean;

    return isAuthenticated;
  }

  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) throw new HttpException("Unauthorised", 401);

    if (err || !user) {
      if (info?.message === "jwt expired") {
        throw new HttpException("Token expired", 401);
      } else if (err) {
        throw err;
      }
      throw new HttpException("Unauthorised", 401);
    }

    this._validateRoles(user, context);

    this.cls.set("userId", user.userId);
    this.cls.set("companyId", user.companyId ?? request.headers["x-companyid"]);
    this.cls.set("roles", user.roles);
    this.cls.set("language", request.headers["x-language"]);
    this.cls.set("token", token.startsWith("Bearer ") ? token.slice(7) : token);

    return user;
  }

  private _validateRoles(user: any, context: any): void {
    const requiredRoles: string[] = this.reflector.get<string[]>("roles", context.getHandler()) ?? [];
    if (requiredRoles.length > 0) {
      if (!requiredRoles.includes(SystemRoles.Administrator)) requiredRoles.push(SystemRoles.Administrator);
      if (!requiredRoles.some((role) => user.roles.includes(role))) throw new HttpException("Unauthorised", 401);
    }
  }
}
