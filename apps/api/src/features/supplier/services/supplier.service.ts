import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiService } from "src/core/jsonapi/services/jsonapi.service";
import { JsonApiPaginator } from "src/core/jsonapi/serialisers/jsonapi.paginator";
import { SupplierPostDataDTO } from "src/features/supplier/dtos/supplier.post.dto";
import { SupplierPutDataDTO } from "src/features/supplier/dtos/supplier.put.dto";
import { SupplierModel } from "src/features/supplier/entities/supplier.model";
import { SupplierRepository } from "src/features/supplier/repositories/supplier.repository";

@Injectable()
export class SupplierService {
  constructor(
    private readonly builder: JsonApiService,
    private readonly supplierRepository: SupplierRepository,
    private readonly clsService: ClsService,
  ) {}

  async find(params: { 
    query: any; 
    term?: string; 
    fetchAll?: boolean;
    orderBy?: string;
  }): Promise<JsonApiDataInterface> {
    const paginator: JsonApiPaginator = new JsonApiPaginator(params.query);

    return this.builder.buildList(
      SupplierModel,
      await this.supplierRepository.find({
        fetchAll: params.fetchAll,
        term: params.term,
        orderBy: params.orderBy,
        cursor: paginator.generateCursor(),
      }),
      paginator,
    );
  }

  async findById(params: { id: string }): Promise<JsonApiDataInterface> {
    return this.builder.buildSingle(
      SupplierModel,
      await this.supplierRepository.findById({
        id: params.id,
      }),
    );
  }

  async create(params: { data: SupplierPostDataDTO }): Promise<JsonApiDataInterface> {
    await this.supplierRepository.create({
      id: params.data.id,
      name: params.data.attributes.name,
      address: params.data.attributes.address,
      email: params.data.attributes.email,
      phone: params.data.attributes.phone,
    });

    return this.findById({ id: params.data.id });
  }

  async put(params: { data: SupplierPutDataDTO }): Promise<JsonApiDataInterface> {
    await this.supplierRepository.put({
      id: params.data.id,
      name: params.data.attributes.name,
      address: params.data.attributes.address,
      email: params.data.attributes.email,
      phone: params.data.attributes.phone,
    });

    return this.findById({ id: params.data.id });
  }

  async delete(params: { id: string }): Promise<void> {
    const supplier = await this.supplierRepository.findById({ id: params.id });
    if (!supplier) throw new NotFoundException();

    if (!this.clsService.get("userId") || (this.clsService.get("companyId") ?? "") !== supplier.company.id)
      throw new ForbiddenException();

    await this.supplierRepository.delete({ id: params.id });
  }
}