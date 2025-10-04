import { ValidationRule } from "test/jsonapi/JsonApiValidator";

export const standardMeta: { [key: string]: ValidationRule } = {
  createdAt: { required: true, type: "date" },
  updatedAt: { required: true, type: "date" },
};
