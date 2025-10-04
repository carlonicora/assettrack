import { AbstractService, HttpMethod, NextRef, PreviousRef } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { Modules } from "@/modules/modules";
import { LoanInput, LoanInterface } from "@/features/features/loan/data/LoanInterface";

export class LoanService extends AbstractService {
  static async findOne(params: { id: string }): Promise<LoanInterface> {
    return this.callApi<LoanInterface>({
      type: Modules.Loan,
      method: HttpMethod.GET,
      endpoint: new EndpointCreator({ endpoint: Modules.Loan, id: params.id }).generate(),
    });
  }

  static async findMany(params: {
    search?: string;
    fetchAll?: boolean;
    next?: NextRef;
    prev?: PreviousRef;
  }): Promise<LoanInterface[]> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Loan });

    if (params.fetchAll) endpoint.addAdditionalParam("fetchAll", "true");
    if (params.search) endpoint.addAdditionalParam("search", params.search);
    if (Modules.Loan.inclusions?.lists?.fields) endpoint.limitToFields(Modules.Loan.inclusions.lists.fields);
    if (Modules.Loan.inclusions?.lists?.types) endpoint.limitToType(Modules.Loan.inclusions.lists.types);

    return this.callApi({
      type: Modules.Loan,
      method: HttpMethod.GET,
      endpoint: endpoint.generate(),
      next: params.next,
    });
  }

  static async findManyByEmployee(params: {
    employeeId: string
    search?: string;
    fetchAll?: boolean;
    next?: NextRef;
    prev?: PreviousRef;
  }): Promise<LoanInterface[]> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Employee, id: params.employeeId, childEndpoint: Modules.Loan });

    if (params.fetchAll) endpoint.addAdditionalParam("fetchAll", "true");
    if (params.search) endpoint.addAdditionalParam("search", params.search);
    if (Modules.Loan.inclusions?.lists?.fields) endpoint.limitToFields(Modules.Loan.inclusions.lists.fields);
    if (Modules.Loan.inclusions?.lists?.types) endpoint.limitToType(Modules.Loan.inclusions.lists.types);

    return this.callApi({
      type: Modules.Loan,
      method: HttpMethod.GET,
      endpoint: endpoint.generate(),
      next: params.next,
    });
  }

  static async findManyByEquipment(params: {
    equipmentId: string
    search?: string;
    fetchAll?: boolean;
    next?: NextRef;
    prev?: PreviousRef;
  }): Promise<LoanInterface[]> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Equipment, id: params.equipmentId, childEndpoint: Modules.Loan });

    if (params.fetchAll) endpoint.addAdditionalParam("fetchAll", "true");
    if (params.search) endpoint.addAdditionalParam("search", params.search);
    if (Modules.Loan.inclusions?.lists?.fields) endpoint.limitToFields(Modules.Loan.inclusions.lists.fields);
    if (Modules.Loan.inclusions?.lists?.types) endpoint.limitToType(Modules.Loan.inclusions.lists.types);

    return this.callApi({
      type: Modules.Loan,
      method: HttpMethod.GET,
      endpoint: endpoint.generate(),
      next: params.next,
    });
  }


  static async create(params: LoanInput): Promise<LoanInterface> {
    return this.callApi({
      type: Modules.Loan,
      method: HttpMethod.POST,
      endpoint: new EndpointCreator({ endpoint: Modules.Loan }).generate(),
      input: params,
    });
  }

  static async update(params: LoanInput): Promise<LoanInterface> {
    return this.callApi({
      type: Modules.Loan,
      method: HttpMethod.PUT,
      endpoint: new EndpointCreator({ endpoint: Modules.Loan, id: params.id }).generate(),
      input: params,
    });
  }

  static async delete(params: { loanId: string }): Promise<void> {
    await this.callApi({
      type: Modules.Loan,
      method: HttpMethod.DELETE,
      endpoint: new EndpointCreator({ endpoint: Modules.Loan, id: params.loanId }).generate(),
    });
  }
}
