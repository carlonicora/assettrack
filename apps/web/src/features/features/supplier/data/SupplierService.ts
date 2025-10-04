import { AbstractService, HttpMethod, NextRef, PreviousRef } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { Modules } from "@/modules/modules";
import { SupplierInput, SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";

export class SupplierService extends AbstractService {
  static async findOne(params: { id: string }): Promise<SupplierInterface> {
    return this.callApi<SupplierInterface>({
      type: Modules.Supplier,
      method: HttpMethod.GET,
      endpoint: new EndpointCreator({ endpoint: Modules.Supplier, id: params.id }).generate(),
    });
  }

  static async findMany(params: {
    search?: string;
    fetchAll?: boolean;
    next?: NextRef;
    prev?: PreviousRef;
  }): Promise<SupplierInterface[]> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Supplier });

    if (params.fetchAll) endpoint.addAdditionalParam("fetchAll", "true");
    if (params.search) endpoint.addAdditionalParam("search", params.search);
    if (Modules.Supplier.inclusions?.lists?.fields) endpoint.limitToFields(Modules.Supplier.inclusions.lists.fields);
    if (Modules.Supplier.inclusions?.lists?.types) endpoint.limitToType(Modules.Supplier.inclusions.lists.types);

    return this.callApi({
      type: Modules.Supplier,
      method: HttpMethod.GET,
      endpoint: endpoint.generate(),
      next: params.next,
    });
  }


  static async create(params: SupplierInput): Promise<SupplierInterface> {
    return this.callApi({
      type: Modules.Supplier,
      method: HttpMethod.POST,
      endpoint: new EndpointCreator({ endpoint: Modules.Supplier }).generate(),
      input: params,
    });
  }

  static async update(params: SupplierInput): Promise<SupplierInterface> {
    return this.callApi({
      type: Modules.Supplier,
      method: HttpMethod.PUT,
      endpoint: new EndpointCreator({ endpoint: Modules.Supplier, id: params.id }).generate(),
      input: params,
    });
  }

  static async delete(params: { supplierId: string }): Promise<void> {
    await this.callApi({
      type: Modules.Supplier,
      method: HttpMethod.DELETE,
      endpoint: new EndpointCreator({ endpoint: Modules.Supplier, id: params.supplierId }).generate(),
    });
  }
}
