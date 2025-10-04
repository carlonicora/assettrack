import { Loan } from "@/features/features/loan/data/Loan";
import { createJsonApiInclusion } from "@/jsonApi/FieldSelector";
import { FactoryType } from "@/permisions/types";

export const LoanModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/loans",
    name: "loans",
    model: Loan,
    moduleId: "fa40cf09-63ec-4da1-be30-dc4c7a667954",
    inclusions: {
      lists: {
        fields: [createJsonApiInclusion("loans", [`startDate`,`endDate`])],
      },
    },
  });
