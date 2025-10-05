import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";

export interface AnalyticInterface extends ApiDataInterface {
  get equipment(): number;
  get loan(): number;
  get expiring30(): number;
  get expiring60(): number;
  get expiring90(): number;
  get expired(): number;
}
