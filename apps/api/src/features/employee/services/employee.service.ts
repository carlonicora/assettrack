import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { JsonApiService } from "src/core/jsonapi/services/jsonapi.service";
import { JsonApiPaginator } from "src/core/jsonapi/serialisers/jsonapi.paginator";
import { EmployeePostDataDTO } from "src/features/employee/dtos/employee.post.dto";
import { EmployeePutDataDTO } from "src/features/employee/dtos/employee.put.dto";
import { EmployeeModel } from "src/features/employee/entities/employee.model";
import { EmployeeRepository } from "src/features/employee/repositories/employee.repository";

@Injectable()
export class EmployeeService {
  constructor(
    private readonly builder: JsonApiService,
    private readonly employeeRepository: EmployeeRepository,
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
      EmployeeModel,
      await this.employeeRepository.find({
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
      EmployeeModel,
      await this.employeeRepository.findById({
        id: params.id,
      }),
    );
  }

  async create(params: { data: EmployeePostDataDTO }): Promise<JsonApiDataInterface> {
    await this.employeeRepository.create({
      id: params.data.id,
      name: params.data.attributes.name,
      phone: params.data.attributes.phone,
      email: params.data.attributes.email,
      avatar: params.data.attributes.avatar,
    });

    return this.findById({ id: params.data.id });
  }

  async put(params: { data: EmployeePutDataDTO }): Promise<JsonApiDataInterface> {
    await this.employeeRepository.put({
      id: params.data.id,
      name: params.data.attributes.name,
      phone: params.data.attributes.phone,
      email: params.data.attributes.email,
      avatar: params.data.attributes.avatar,
    });

    return this.findById({ id: params.data.id });
  }

  async delete(params: { id: string }): Promise<void> {
    const employee = await this.employeeRepository.findById({ id: params.id });
    if (!employee) throw new NotFoundException();

    if (!this.clsService.get("userId") || (this.clsService.get("companyId") ?? "") !== employee.company.id)
      throw new ForbiddenException();

    await this.employeeRepository.delete({ id: params.id });
  }
}
