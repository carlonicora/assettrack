import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { RoleId } from "src/foundations/role/enums/role.id";

import { AdminJwtAuthGuard } from "src/common/guards/jwt.auth.admin.guard";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { FeatureService } from "src/foundations/feature/services/feature.service";

@Controller(featureMeta.endpoint)
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @UseGuards(AdminJwtAuthGuard, JwtAuthGuard)
  @Get()
  @Roles(RoleId.Administrator, RoleId.CompanyAdministrator)
  async findBySearch(@Request() req: any, @Query() query: any, @Query("search") search?: string) {
    return await this.featureService.find({ query: query, term: search });
  }
}
