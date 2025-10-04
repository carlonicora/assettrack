import { CompanyInput, CompanyInterface } from "@/features/foundations/company/data/CompanyInterface";
import { FeatureInterface } from "@/features/foundations/feature/data/FeatureInterface";
import { ModuleInterface } from "@/features/foundations/module/data/ModuleInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";

export class Company extends AbstractApiData implements CompanyInterface {
  private _name?: string;
  private _logo?: string;
  private _logoUrl?: string;

  private _licenseExpirationDate?: Date;

  private _features?: FeatureInterface[];
  private _modules?: ModuleInterface[];

  get name(): string {
    if (this._name === undefined) throw new Error("Name is not defined");
    return this._name;
  }

  get logo(): string | undefined {
    return this._logo;
  }

  get logoUrl(): string | undefined {
    return this._logoUrl;
  }

  get licenseExpirationDate(): Date | undefined {
    return this._licenseExpirationDate;
  }

  get features(): FeatureInterface[] {
    return this._features ?? [];
  }

  get modules(): ModuleInterface[] {
    return this._modules ?? [];
  }

  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._name = data.jsonApi.attributes.name;
    this._logo = data.jsonApi.attributes.logo;
    this._logoUrl = data.jsonApi.attributes.logoUrl;

    this._licenseExpirationDate = data.jsonApi.attributes.licenseExpirationDate
      ? new Date(data.jsonApi.attributes.licenseExpirationDate)
      : undefined;

    this._features = this._readIncluded<FeatureInterface>(data, "features", Modules.Feature) as FeatureInterface[];
    this._modules = this._readIncluded<ModuleInterface>(data, "modules", Modules.Module) as ModuleInterface[];

    return this;
  }

  createJsonApi(data: CompanyInput) {
    const response: any = {
      data: {
        type: Modules.Company.name,
        id: data.id,
        attributes: {},
        meta: {},
        relationships: {},
      },
      included: [],
    };

    if (data.name) response.data.attributes.name = data.name;
    if (data.logo) response.data.attributes.logo = data.logo;
    if (data.license) response.data.attributes.license = data.license;
    if (data.privateKey) response.data.attributes.privateKey = data.privateKey;

    if (data.featureIds && data.featureIds.length > 0) {
      response.data.relationships.features = {
        data: data.featureIds.map((featureId) => ({
          type: Modules.Feature.name,
          id: featureId,
        })),
      };
    }

    if (data.moduleIds && data.moduleIds.length > 0) {
      response.data.relationships.modules = {
        data: data.moduleIds.map((moduleId) => ({
          type: Modules.Module.name,
          id: moduleId,
        })),
      };
    }

    return response;
  }
}
