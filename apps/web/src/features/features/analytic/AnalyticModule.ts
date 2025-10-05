import { Analytic } from "@/features/features/analytic/data/Analytic";
import { createJsonApiInclusion } from "@/jsonApi/FieldSelector";
import { FactoryType } from "@/permisions/types";

export const AnalyticModule = (factory: FactoryType) =>
  factory({
    pageUrl: "/analytics",
    name: "analytics",
    model: Analytic,
    moduleId: "ee1f7bf6-92a1-4b22-b36f-adcff4b557ca",
    inclusions: {
      lists: {
        fields: [createJsonApiInclusion("analytics", [`equipment`,`loan`,`expiring30`,`expiring60`,`expiring90`,`expired`])],
      },
    },
  });
