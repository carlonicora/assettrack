import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Analytic } from "src/features/analytic/entities/analytic.entity";
import { mapAnalytic } from "src/features/analytic/entities/analytic.map";
import { analyticMeta } from "src/features/analytic/entities/analytic.meta";
import { AnalyticSerialiser } from "src/features/analytic/serialisers/analytic.serialiser";
import { companyMeta } from "src/foundations/company/entities/company.meta";

export const AnalyticModel: DataModelInterface<Analytic> = {
  ...analyticMeta,
  entity: undefined as unknown as Analytic,
  mapper: mapAnalytic,
  serialiser: AnalyticSerialiser,
  singleChildrenTokens: [companyMeta.nodeName],
  childrenTokens: [],
};
