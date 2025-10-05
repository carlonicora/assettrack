import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  PreconditionFailedException,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { CacheService } from "src/core/cache/services/cache.service";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { LoanPostDTO } from "src/features/loan/dtos/loan.post.dto";
import { LoanPutDTO } from "src/features/loan/dtos/loan.put.dto";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import { LoanService } from "src/features/loan/services/loan.service";
import { AuditService } from "src/foundations/audit/services/audit.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class LoanController {
  constructor(
    private readonly loanService: LoanService,
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService,
  ) {}

  @Get(loanMeta.endpoint)
  async findLoans(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("fetchAll") fetchAll?: boolean,
    @Query("orderBy") orderBy?: string,
    @Query("active") active?: boolean,
  ) {
    const response = await this.loanService.find({
      term: search,
      query: query,
      fetchAll: fetchAll,
      orderBy: orderBy,
      active: active,
    });

    reply.send(response);
  }

  @Get(`${loanMeta.endpoint}/:loanId`)
  async findById(@Req() req: AuthenticatedRequest, @Res() reply: FastifyReply, @Param("loanId") loanId: string) {
    const response = await this.loanService.findById({
      id: loanId,
    });

    reply.send(response);

    this.auditService.createAuditEntry({ entityType: loanMeta.labelName, entityId: loanId });
  }

  @Post(loanMeta.endpoint)
  async createLoan(@Req() req: AuthenticatedRequest, @Res() reply: FastifyReply, @Body() body: LoanPostDTO) {
    const response = await this.loanService.create({
      data: body.data,
    });

    reply.send(response);

    await this.cacheService.invalidateByType(loanMeta.endpoint);
  }

  @Put(`${loanMeta.endpoint}/:loanId`)
  async updateLoan(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("loanId") loanId: string,
    @Body() body: LoanPutDTO,
  ) {
    if (loanId !== body.data.id)
      throw new PreconditionFailedException("Loan ID in the URL does not match the ID in the body");

    const response = await this.loanService.put({
      data: body.data,
    });

    reply.send(response);

    await this.cacheService.invalidateByElement(loanMeta.endpoint, loanId);
  }

  @Delete(`${loanMeta.endpoint}/:loanId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLoan(@Req() req: AuthenticatedRequest, @Res() reply: FastifyReply, @Param("loanId") loanId: string) {
    await this.loanService.delete({ id: loanId });
    reply.send();

    await this.cacheService.invalidateByElement(loanMeta.endpoint, loanId);
  }

  @Get(`${employeeMeta.endpoint}/:employeeId/${loanMeta.endpoint}`)
  async findByEmployee(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("employeeId") employeeId: string,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("fetchAll") fetchAll?: boolean,
    @Query("orderBy") orderBy?: string,
  ) {
    const response = await this.loanService.findByEmployee({
      employeeId: employeeId,
      term: search,
      query: query,
      fetchAll: fetchAll,
      orderBy: orderBy,
    });

    reply.send(response);
  }

  @Get(`${equipmentMeta.endpoint}/:equipmentId/${loanMeta.endpoint}`)
  async findByEquipment(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("equipmentId") equipmentId: string,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("fetchAll") fetchAll?: boolean,
    @Query("orderBy") orderBy?: string,
  ) {
    const response = await this.loanService.findByEquipment({
      equipmentId: equipmentId,
      term: search,
      query: query,
      fetchAll: fetchAll,
      orderBy: orderBy,
    });

    reply.send(response);
  }
}
