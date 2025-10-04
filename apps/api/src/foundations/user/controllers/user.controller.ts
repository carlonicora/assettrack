import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { SecurityService } from "src/core/security/services/security.service";

import { FastifyReply } from "fastify";
import { ClsService } from "nestjs-cls";
import { Roles } from "src/common/decorators/roles.decorator";
import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { CacheService } from "src/core/cache/services/cache.service";
import { CompanyPostDataDTO } from "src/foundations/company/dtos/company.post.dto";
import { CompanyService } from "src/foundations/company/services/company.service";
import { roleMeta } from "src/foundations/role/entities/role.meta";
import { RoleId } from "src/foundations/role/enums/role.id";
import { UserPatchRateDTO } from "src/foundations/user/dtos/user.patch.rate.dto";
import { UserPostDTO } from "src/foundations/user/dtos/user.post.dto";
import { UserPutDTO } from "src/foundations/user/dtos/user.put.dto";
import { userMeta } from "src/foundations/user/entities/user.meta";
import { UserService } from "../services/user.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly security: SecurityService,
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly clsService: ClsService,
  ) {}

  @Get(userMeta.endpoint)
  async findBySearch(
    @Req() request: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("includeDeleted") includeDeleted?: boolean,
  ) {
    const isAdmin = this.security.isUserInRoles({
      user: request.user,
      roles: [RoleId.Administrator, RoleId.CompanyAdministrator],
    });

    const response = await this.users.findMany({
      query: query,
      term: search,
      isAdmin: isAdmin,
      includeDeleted: includeDeleted ?? false,
    });

    reply.send(response);
  }

  @Get(`${userMeta.endpoint}/:userId`)
  async findOneByUserId(@Request() req: any, @Param("userId") userId: string) {
    if (userId === "me") userId = req.user?.userId;

    if (this.security.isUserInRoles({ user: req.user, roles: [RoleId.Administrator] }))
      return await this.users.findOneForAdmin({ userId: userId });

    return await this.users.findByUserId({
      userId: userId,
    });
  }

  @Get(`${userMeta.endpoint}/me/full`)
  async findFullUser(@Req() request: AuthenticatedRequest, @Res() reply: FastifyReply) {
    const userId = request.user?.userId;

    const response = await this.users.findFullUser({
      userId: userId,
    });

    reply.send(response);
  }

  @Get(`${userMeta.endpoint}/email/:email`)
  async findOneByEmail(@Param("email") email: string) {
    return this.users.findByEmail({ email: email });
  }

  @Post(userMeta.endpoint)
  @Roles(RoleId.Administrator, RoleId.CompanyAdministrator, RoleId.HumanResource)
  async createUser(
    @Req() request: any,
    @Body() body: UserPostDTO,
    @Res() reply: FastifyReply,
    @Query("lng") lng?: string,
  ) {
    try {
      await this.users.expectNotExists({ email: body.data.attributes.email });
    } catch {
      return this.users.findByEmail({ email: body.data.attributes.email });
    }

    let forceCompanyAdmin = false;
    if (body.included.length === 0) {
      await this.companyService.validate({
        companyId: body.data.relationships.company.data.id,
      });
    } else {
      await this.companyService.create({
        data: body.included[0] as CompanyPostDataDTO,
      });
      forceCompanyAdmin = true;
    }

    const response = await this.users.create({
      data: body.data,
      forceCompanyAdmin: forceCompanyAdmin,
      language: lng ?? "it",
    });

    reply.send(response);

    await this.cacheService.invalidateByType(userMeta.endpoint);
  }

  @Put(`${userMeta.endpoint}/:userId`)
  async put(
    @Request() request: any,
    @Param("userId") userId: string,
    @Body() body: UserPutDTO,
    @Res() reply: FastifyReply,
  ) {
    if (request.user.userId !== userId) this.security.validateAdmin({ user: request.user });

    const isAdmin = this.security.isUserInRoles({
      user: request.user,
      roles: [RoleId.Administrator, RoleId.CompanyAdministrator],
    });

    const response = await this.users.put({
      data: body.data,
      isAdmin: isAdmin,
      isCurrentUser: request.user.userId === userId,
    });
    reply.send(response);

    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
  }

  @Patch(`${userMeta.endpoint}/:userId`)
  async reactivateUser(@Request() request: any, @Param("userId") userId: string, @Res() reply: FastifyReply) {
    this.security.validateAdmin({ user: request.user });

    const response = await this.users.reactivate({ userId: userId });
    reply.send(response);

    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
  }

  @Patch(`${userMeta.endpoint}/:userId/rates`)
  @Roles(RoleId.CompanyAdministrator)
  async updateUserRates(
    @Request() request: any,
    @Param("userId") userId: string,
    @Body() body: UserPatchRateDTO,
    @Res() reply: FastifyReply,
  ) {
    const response = await this.users.patchRate({ data: body.data });
    reply.send(response);

    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(`${userMeta.endpoint}/:userId/send-invitation-email`)
  async sendInvitationEmail(@Request() request: any, @Param("userId") userId: string) {
    this.security.validateAdmin({ user: request.user });
    await this.users.sendInvitationEmail({ userId: userId });

    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(`${userMeta.endpoint}/:userId`)
  async delete(@Param("userId") userId: string) {
    await this.users.delete({
      userId: userId,
    });
    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(`${roleMeta.endpoint}/:roleId/${userMeta.endpoint}`)
  async findUserByRole(
    @Request() req: any,
    @Query() query: any,
    @Param("roleId") roleId: string,
    @Query("notInRole") notInRole?: boolean,
    @Query("search") search?: string,
  ) {
    const isAdmin = this.security.isUserInRoles({
      user: req.user,
      roles: [RoleId.Administrator, RoleId.CompanyAdministrator],
    });
    if (notInRole)
      return await this.users.findNotInRole({
        roleId: roleId,
        term: search,
        query: query,
        isAdmin: isAdmin,
      });

    return await this.users.findInRole({
      roleId: roleId,
      term: search,
      query: query,
      isAdmin: isAdmin,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(`${roleMeta.endpoint}/:roleId/${userMeta.endpoint}/:userId`)
  async addUserToRole(
    @Request() req: any,
    @Param("roleId") roleId: string,
    @Param("userId") userId: string,
    @Res() reply: FastifyReply,
  ) {
    const isAdmin = this.security.isUserInRoles({
      user: req.user,
      roles: [RoleId.Administrator, RoleId.CompanyAdministrator],
    });

    if (!isAdmin && req.user.userId !== userId)
      throw new HttpException("You are not allowed to edit this user", HttpStatus.FORBIDDEN);

    const response = await this.users.addUserToRole({
      userId: userId,
      roleId: roleId,
      returnsFull: isAdmin || req.user.userId === userId,
    });

    reply.send(response);
    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
    await this.cacheService.invalidateByElement(roleMeta.endpoint, roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(`${roleMeta.endpoint}/:roleId/${userMeta.endpoint}/:userId`)
  async removeUserToRole(@Request() req: any, @Param("roleId") roleId: string, @Param("userId") userId: string) {
    const isAdmin = this.security.isUserInRoles({
      user: req.user,
      roles: [RoleId.Administrator, RoleId.CompanyAdministrator],
    });

    if (!isAdmin && req.user.userId !== userId)
      throw new HttpException("You are not allowed to edit this user", HttpStatus.FORBIDDEN);

    await this.users.removeUserFromRole({
      roleId: roleId,
      userId: userId,
      returnsFull: isAdmin || req.user.userId === userId,
    });

    await this.cacheService.invalidateByElement(userMeta.endpoint, userId);
    await this.cacheService.invalidateByElement(roleMeta.endpoint, roleId);
  }
}
