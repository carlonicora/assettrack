import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { SecurityService } from "src/core/security/services/security.service";
import { roleMeta } from "src/foundations/role/entities/role.meta";

import { RoleService } from "src/foundations/role/services/role.service";
import { userMeta } from "src/foundations/user/entities/user.meta";

@Controller(userMeta.endpoint)
export class RoleUserController {
  constructor(
    private readonly roleServide: RoleService,
    private readonly security: SecurityService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(`:userId/${roleMeta.endpoint}`)
  async findBySearch(
    @Request() req: any,
    @Query() query: any,
    @Param("userId") userId: string,
    @Query("search") search?: string,
    @Query("userNotIn") userNotIn?: boolean,
  ) {
    if (userNotIn)
      return await this.roleServide.findNotInUser({
        userId: userId,
        term: search,
        query: query,
      });

    return await this.roleServide.findForUser({
      userId: userId,
      term: search,
      query: query,
    });
  }
}
