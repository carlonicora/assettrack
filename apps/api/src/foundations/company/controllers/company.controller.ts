import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { Roles } from "src/common/decorators/roles.decorator";
import { AdminJwtAuthGuard } from "src/common/guards/jwt.auth.admin.guard";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { RoleId } from "src/foundations/role/enums/role.id";

import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { CacheService } from "src/core/cache/services/cache.service";
import { CompanyLicensePutDTO } from "src/foundations/company/dtos/company.license.put.dto";
import { CompanyPostDTO } from "src/foundations/company/dtos/company.post.dto";
import { CompanyPutDTO } from "src/foundations/company/dtos/company.put.dto";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { CompanyService } from "src/foundations/company/services/company.service";

@Controller()
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
  ) {}

  @UseGuards(AdminJwtAuthGuard)
  @Roles(RoleId.Administrator)
  @Get(companyMeta.endpoint)
  async fetchAllCompanies(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Query() query: any,
    @Query("search") search?: string,
  ) {
    const response = await this.companyService.find({ term: search, query: query });
    reply.send(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get(`${companyMeta.endpoint}/:companyId`)
  async findCompany(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("companyId") companyId: string,
  ) {
    if (request.user.companyId !== companyId && !request.user.roles.includes(RoleId.Administrator))
      throw new HttpException("Unauthorised", 401);

    const response = await this.companyService.findOne({ companyId: companyId });
    reply.send(response);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Roles(RoleId.Administrator)
  @Post(companyMeta.endpoint)
  async create(@Req() request: AuthenticatedRequest, @Res() reply: FastifyReply, @Body() body: CompanyPostDTO) {
    const response = await this.companyService.createForController({ data: body.data });
    reply.send(response);

    await this.cacheService.invalidateByType(companyMeta.endpoint);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleId.Administrator, RoleId.CompanyAdministrator)
  @Put(`${companyMeta.endpoint}/:companyId`)
  async update(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Body() body: CompanyPutDTO,
    @Param("companyId") companyId: string,
  ) {
    if (request.user.companyId !== companyId && !request.user.roles.includes(RoleId.Administrator))
      throw new HttpException("Unauthorised", 401);

    if (companyId !== body.data.id)
      throw new HttpException("Company Id does not match the {json:api} id", HttpStatus.PRECONDITION_FAILED);

    const response = await this.companyService.update({ data: body.data });
    reply.send(response);

    await this.cacheService.invalidateByElement(companyMeta.endpoint, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleId.Administrator)
  @Delete(`${companyMeta.endpoint}/:companyId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("companyId") companyId: string,
  ) {
    await this.companyService.delete({ companyId: companyId });
    reply.send();

    await this.cacheService.invalidateByElement(companyMeta.endpoint, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleId.Administrator, RoleId.CompanyAdministrator)
  @Put(`${companyMeta.endpoint}/:companyId/license`)
  async activateLicense(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("companyId") companyId: string,
    @Body() body: CompanyLicensePutDTO,
  ) {
    const response = await this.companyService.activateLicense({ companyId: companyId, data: body.data });
    reply.send(response);

    await this.cacheService.invalidateByType(companyMeta.endpoint);
  }
}
