import { ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ClsService } from "nestjs-cls";
import { SystemRoles } from "src/common/constants/system.role.id";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
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

    if (!authorizationHeader && request.user) {
      return true;
    }

    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) return null;

    if (err || !user) {
      if (info?.message === "jwt expired") {
        throw new HttpException("Token expired", 401);
      } else if (err) {
        throw err;
      }
      return null;
    }

    this._validateRoles(user, context);

    this.cls.set("userId", user.userId);
    this.cls.set("companyId", user.companyId ?? request.headers["x-companyid"]);
    this.cls.set("language", request.headers["x-language"]);
    this.cls.set("roles", user.roles);

    return user;
  }

  private _validateRoles(user: any, context: any): void {
    const requiredRoles: string[] = this.reflector.get<string[]>("roles", context.getHandler()) ?? [];
    if (requiredRoles.length > 0) {
      if (!user) throw new HttpException("Unauthorised", 401);
      if (!requiredRoles.includes(SystemRoles.Administrator)) requiredRoles.push(SystemRoles.Administrator);
      if (!requiredRoles.some((role) => user.roles.includes(role))) throw new HttpException("Unauthorised", 401);
    }
  }
}
