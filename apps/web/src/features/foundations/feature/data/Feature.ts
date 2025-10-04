import { ModuleInterface } from "@/features/foundations/module/data/ModuleInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";
import { FeatureInterface } from "./FeatureInterface";

export class Feature extends AbstractApiData implements FeatureInterface {
  private _name?: string;
  private _isProduction?: boolean;

  private _modules: ModuleInterface[] = [];

  get name(): string {
    return this._name ?? "";
  }

  get isProduction(): boolean {
    return this._isProduction == true ? true : false;
  }

  get modules(): ModuleInterface[] {
    return this._modules;
  }

  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._name = data.jsonApi.attributes.name;
    this._isProduction = data.jsonApi.attributes.isProduction ?? false;

    this._modules = this._readIncluded(data, `modules`, Modules.Module) as ModuleInterface[];

    return this;
  }
}
