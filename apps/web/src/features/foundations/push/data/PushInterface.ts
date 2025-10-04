import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export type PushInput = {
  key: string;
  contentType?: string;
};

export interface PushInterface extends ApiDataInterface {}
