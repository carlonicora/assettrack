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
import { SupplierPostDTO } from "src/features/supplier/dtos/supplier.post.dto";
import { SupplierPutDTO } from "src/features/supplier/dtos/supplier.put.dto";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { SupplierService } from "src/features/supplier/services/supplier.service";
import { AuditService } from "src/foundations/audit/services/audit.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class SupplierController {
  constructor(
    private readonly supplierService: SupplierService,
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService,
  ) {}

  @Get(supplierMeta.endpoint)
  async findSuppliers(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Query() query: any,
    @Query("search") search?: string,
    @Query("fetchAll") fetchAll?: boolean,
    @Query("orderBy") orderBy?: string,
  ) {
    const response = await this.supplierService.find({
      term: search,
      query: query,
      fetchAll: fetchAll,
      orderBy: orderBy,
    });

    reply.send(response);
  }

  @Get(`${supplierMeta.endpoint}/:supplierId`)
  async findById(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("supplierId") supplierId: string,
  ) {
    const response = await this.supplierService.findById({
      id: supplierId,
    });

    reply.send(response);

    this.auditService.createAuditEntry({ entityType: supplierMeta.labelName, entityId: supplierId });
  }

  @Post(supplierMeta.endpoint)
  async createSupplier(@Req() req: AuthenticatedRequest, @Res() reply: FastifyReply, @Body() body: SupplierPostDTO) {
    const response = await this.supplierService.create({
      data: body.data,
    });

    reply.send(response);

    await this.cacheService.invalidateByType(supplierMeta.endpoint);
  }

  @Put(`${supplierMeta.endpoint}/:supplierId`)
  async updateSupplier(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("supplierId") supplierId: string,
    @Body() body: SupplierPutDTO,
  ) {
    if (supplierId !== body.data.id)
      throw new PreconditionFailedException("Supplier ID in the URL does not match the ID in the body");

    const response = await this.supplierService.put({
      data: body.data,
    });

    reply.send(response);

    await this.cacheService.invalidateByElement(supplierMeta.endpoint, supplierId);
  }

  @Delete(`${supplierMeta.endpoint}/:supplierId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSupplier(
    @Req() req: AuthenticatedRequest,
    @Res() reply: FastifyReply,
    @Param("supplierId") supplierId: string,
  ) {
    await this.supplierService.delete({ id: supplierId });
    reply.send();

    await this.cacheService.invalidateByElement(supplierMeta.endpoint, supplierId);
  }
}
