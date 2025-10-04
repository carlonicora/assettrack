import { FieldSelector } from "@/jsonApi/FieldSelector";

export type ApiRequestDataTypeInterface = {
  name: string;
  cache?: string;
  inclusions?: Record<
    string,
    {
      types?: string[];
      fields?: FieldSelector<any>[];
    }
  >;
  model: new () => any;
};
