import { Loan } from "@/features/features/loan/data/Loan";
import { createJsonApiInclusion } from "@/jsonApi/FieldSelector";
import { FactoryType } from "@/permisions/types";

export const LoanModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/loans",
    name: "loans",
    model: Loan,
    moduleId: "",
    inclusions: {
      lists: {
        fields: [createJsonApiInclusion("loans", [`name`,`startDate`,`endDate`])],
      },
    },
  });
