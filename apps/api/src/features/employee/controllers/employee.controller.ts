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

import { CacheService } from "src/core/cache/services/cache.service";
import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { EmployeePostDTO } from "src/features/employee/dtos/employee.post.dto";
import { EmployeePutDTO } from "src/features/employee/dtos/employee.put.dto";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { EmployeeService } from "src/features/employee/services/employee.service";
import { AuditService } from "src/foundations/audit/services/audit.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService,
  ) {}

  @Get(employeeMeta.endpoint)
  async findEmployees(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("fetchAll") fetchAll?: boolean,
    @Query("orderBy") orderBy?: string,
  ) {
    const response = await this.employeeService.find({
      term: search,
      query: query,
      fetchAll: fetchAll,
      orderBy: orderBy,
    });

    reply.send(response);
  }

  @Get(`${employeeMeta.endpoint}/:employeeId`)
  async findById(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("employeeId") employeeId: string,
  ) {
    const response = await this.employeeService.findById({
      id: employeeId,
    });

    reply.send(response);

    this.auditService.createAuditEntry({ entityType: employeeMeta.labelName, entityId: employeeId });
  }

  @Post(employeeMeta.endpoint)
  async createEmployee(@Req() req: AuthenticatedRequest, @Res() reply: FastifyReply, @Body() body: EmployeePostDTO) {
    const response = await this.employeeService.create({
      data: body.data,
    });

    reply.send(response);

    await this.cacheService.invalidateByType(employeeMeta.endpoint);
  }

  @Put(`${employeeMeta.endpoint}/:employeeId`)
  async updateEmployee(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("employeeId") employeeId: string,
    @Body() body: EmployeePutDTO,
  ) {
    if (employeeId !== body.data.id)
      throw new PreconditionFailedException("Employee ID in the URL does not match the ID in the body");

    const response = await this.employeeService.put({
      data: body.data,
    });

    reply.send(response);

    await this.cacheService.invalidateByElement(employeeMeta.endpoint, employeeId);
  }

  @Delete(`${employeeMeta.endpoint}/:employeeId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEmployee(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("employeeId") employeeId: string,
  ) {
    await this.employeeService.delete({ id: employeeId });
    reply.send();

    await this.cacheService.invalidateByElement(employeeMeta.endpoint, employeeId);
  }
}
