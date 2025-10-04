import { AbstractService, HttpMethod, NextRef, PreviousRef } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { Modules } from "@/modules/modules";
import { EmployeeInput, EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";

export class EmployeeService extends AbstractService {
  static async findOne(params: { id: string }): Promise<EmployeeInterface> {
    return this.callApi<EmployeeInterface>({
      type: Modules.Employee,
      method: HttpMethod.GET,
      endpoint: new EndpointCreator({ endpoint: Modules.Employee, id: params.id }).generate(),
    });
  }

  static async findMany(params: {
    search?: string;
    fetchAll?: boolean;
    next?: NextRef;
    prev?: PreviousRef;
  }): Promise<EmployeeInterface[]> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Employee });

    if (params.fetchAll) endpoint.addAdditionalParam("fetchAll", "true");
    if (params.search) endpoint.addAdditionalParam("search", params.search);
    if (Modules.Employee.inclusions?.lists?.fields) endpoint.limitToFields(Modules.Employee.inclusions.lists.fields);
    if (Modules.Employee.inclusions?.lists?.types) endpoint.limitToType(Modules.Employee.inclusions.lists.types);

    return this.callApi({
      type: Modules.Employee,
      method: HttpMethod.GET,
      endpoint: endpoint.generate(),
      next: params.next,
    });
  }


  static async create(params: EmployeeInput): Promise<EmployeeInterface> {
    return this.callApi({
      type: Modules.Employee,
      method: HttpMethod.POST,
      endpoint: new EndpointCreator({ endpoint: Modules.Employee }).generate(),
      input: params,
    });
  }

  static async update(params: EmployeeInput): Promise<EmployeeInterface> {
    return this.callApi({
      type: Modules.Employee,
      method: HttpMethod.PUT,
      endpoint: new EndpointCreator({ endpoint: Modules.Employee, id: params.id }).generate(),
      input: params,
    });
  }

  static async delete(params: { employeeId: string }): Promise<void> {
    await this.callApi({
      type: Modules.Employee,
      method: HttpMethod.DELETE,
      endpoint: new EndpointCreator({ endpoint: Modules.Employee, id: params.employeeId }).generate(),
    });
  }
}
