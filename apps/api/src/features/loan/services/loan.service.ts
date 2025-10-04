import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiService } from "src/core/jsonapi/services/jsonapi.service";
import { JsonApiPaginator } from "src/core/jsonapi/serialisers/jsonapi.paginator";
import { LoanPostDataDTO } from "src/features/loan/dtos/loan.post.dto";
import { LoanPutDataDTO } from "src/features/loan/dtos/loan.put.dto";
import { LoanModel } from "src/features/loan/entities/loan.model";
import { LoanRepository } from "src/features/loan/repositories/loan.repository";

@Injectable()
export class LoanService {
  constructor(
    private readonly builder: JsonApiService,
    private readonly loanRepository: LoanRepository,
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
      LoanModel,
      await this.loanRepository.find({
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
      LoanModel,
      await this.loanRepository.findById({
        id: params.id,
      }),
    );
  }

  async create(params: { data: LoanPostDataDTO }): Promise<JsonApiDataInterface> {
    await this.loanRepository.create({
      id: params.data.id,
      startDate: params.data.attributes.startDate,
      endDate: params.data.attributes.endDate,
      employeeIds: params.data.relationships.employee.data.id,
      equipmentIds: params.data.relationships.equipment.data.id,
    });

    return this.findById({ id: params.data.id });
  }

  async put(params: { data: LoanPutDataDTO }): Promise<JsonApiDataInterface> {
    await this.loanRepository.put({
      id: params.data.id,
      startDate: params.data.attributes.startDate,
      endDate: params.data.attributes.endDate,
      employeeIds: params.data.relationships.employee.data.id,
      equipmentIds: params.data.relationships.equipment.data.id,
    });

    return this.findById({ id: params.data.id });
  }

  async delete(params: { id: string }): Promise<void> {
    const loan = await this.loanRepository.findById({ id: params.id });
    if (!loan) throw new NotFoundException();

    if (!this.clsService.get("userId") || (this.clsService.get("companyId") ?? "") !== loan.company.id)
      throw new ForbiddenException();

    await this.loanRepository.delete({ id: params.id });
  }

  async findByEmployee(params: {
    employeeId: string, 
    query: any; 
    term?: string; 
    fetchAll?: boolean;
    orderBy?: string;
  }) {
    const paginator: JsonApiPaginator = new JsonApiPaginator(params.query);

    return this.builder.buildList(
      LoanModel,
      await this.loanRepository.findByEmployee({
        employeeId: params.employeeId,
        fetchAll: params.fetchAll,
        term: params.term,
        orderBy: params.orderBy,
        cursor: paginator.generateCursor(),
      }),
      paginator,
    );
  }

  async findByEquipment(params: {
    equipmentId: string, 
    query: any; 
    term?: string; 
    fetchAll?: boolean;
    orderBy?: string;
  }) {
    const paginator: JsonApiPaginator = new JsonApiPaginator(params.query);

    return this.builder.buildList(
      LoanModel,
      await this.loanRepository.findByEquipment({
        equipmentId: params.equipmentId,
        fetchAll: params.fetchAll,
        term: params.term,
        orderBy: params.orderBy,
        cursor: paginator.generateCursor(),
      }),
      paginator,
    );
  }
}