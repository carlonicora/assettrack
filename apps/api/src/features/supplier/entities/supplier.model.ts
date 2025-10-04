import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Supplier } from "src/features/supplier/entities/supplier.entity";
import { mapSupplier } from "src/features/supplier/entities/supplier.map";
import { supplierMeta } from "src/features/supplier/entities/supplier.meta";
import { SupplierSerialiser } from "src/features/supplier/serialisers/supplier.serialiser";
import { companyMeta } from "src/foundations/company/entities/company.meta";

export const SupplierModel: DataModelInterface<Supplier> = {
  ...supplierMeta,
  entity: undefined as unknown as Supplier,
  mapper: mapSupplier,
  serialiser: SupplierSerialiser,
  singleChildrenTokens: [companyMeta.nodeName,],
  childrenTokens: []
};