import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Company } from "src/foundations/company/entities/company.entity";
import { mapCompany } from "src/foundations/company/entities/company.map";
import { companyMeta } from "src/foundations/company/entities/company.meta";
import { CompanySerialiser } from "src/foundations/company/serialisers/company.serialiser";
import { featureMeta } from "src/foundations/feature/entities/feature.meta";
import { moduleMeta } from "src/foundations/module/entities/module.meta";

export const CompanyModel: DataModelInterface<Company> = {
  ...companyMeta,
  entity: undefined as unknown as Company,
  mapper: mapCompany,
  serialiser: CompanySerialiser,
  singleChildrenTokens: [],
  childrenTokens: [featureMeta.nodeName, moduleMeta.nodeName],
};
