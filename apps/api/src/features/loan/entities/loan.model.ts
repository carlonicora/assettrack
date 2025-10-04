import { DataModelInterface } from "src/common/interfaces/datamodel.interface";
import { Loan } from "src/features/loan/entities/loan.entity";
import { mapLoan } from "src/features/loan/entities/loan.map";
import { loanMeta } from "src/features/loan/entities/loan.meta";
import { LoanSerialiser } from "src/features/loan/serialisers/loan.serialiser";
import { employeeMeta } from "src/features/employee/entities/employee.meta";
import { equipmentMeta } from "src/features/equipment/entities/equipment.meta";
import { companyMeta } from "src/foundations/company/entities/company.meta";

export const LoanModel: DataModelInterface<Loan> = {
  ...loanMeta,
  entity: undefined as unknown as Loan,
  mapper: mapLoan,
  serialiser: LoanSerialiser,
  singleChildrenTokens: [companyMeta.nodeName,employeeMeta.nodeName, equipmentMeta.nodeName, ],
  childrenTokens: []
};