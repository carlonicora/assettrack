import { DataBootstrapper } from "@/data/DataBootstrapper";
import { RehydrationFactory } from "@/jsonApi/factories/RehydrationFactory";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "@/jsonApi/interfaces/ApiRequestDataTypeInterface";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";

export function rehydrate<T extends ApiDataInterface>(
  dataList: ApiRequestDataTypeInterface,
  data: JsonApiHydratedDataInterface,
): T {
  DataBootstrapper.bootstrap();
  return RehydrationFactory.rehydrate(dataList, data) as T;
}

export function rehydrateList<T extends ApiDataInterface>(
  dataList: ApiRequestDataTypeInterface,
  data: JsonApiHydratedDataInterface[],
): T[] {
  DataBootstrapper.bootstrap();
  return RehydrationFactory.rehydrateList(dataList, data) as T[];
}
