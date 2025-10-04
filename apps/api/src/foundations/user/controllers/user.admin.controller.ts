import { Controller, Get, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import { SecurityService } from "src/core/security/services/security.service";

import { FastifyReply } from "fastify";
import { ClsService } from "nestjs-cls";
import { Roles } from "src/common/decorators/roles.decorator";
import { AdminJwtAuthGuard } from "src/common/guards/jwt.auth.admin.guard";
import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { CacheService } from "src/core/cache/services/cache.service";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { CompanyService } from "src/foundations/company/services/company.service";
import { RoleId } from "src/foundations/role/enums/role.id";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { UserService } from "../services/user.service";

@Controller()
export class UserAdminController {
  constructor(
    private readonly users: UserService,
    private readonly security: SecurityService,
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly clsService: ClsService,
  ) {}

  @UseGuards(AdminJwtAuthGuard)
  @Roles(RoleId.Administrator)
  @Get(`${companyMeta.endpoint}/:companyId/${userMeta.endpoint}`)
  async findByCompany(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("companyId") companyId: string,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("includeDeleted") includeDeleted?: boolean,
  ) {
    const isAdmin = this.security.isUserInRoles({
      user: request.user,
      roles: [RoleId.Administrator, RoleId.CompanyAdministrator],
    });

    this.clsService.set("companyId", companyId);

    const response = await this.users.findManyByCompany({
      query: query,
      term: search,
      isAdmin: isAdmin,
      includeDeleted: includeDeleted ?? false,
      companyId: companyId,
    });

    reply.send(response);
  }
}
