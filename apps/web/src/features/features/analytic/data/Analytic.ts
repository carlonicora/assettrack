import { AnalyticInterface } from "@/features/features/analytic/data/AnalyticInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";

export class Analytic extends AbstractApiData implements AnalyticInterface {
  private _equipment?: number;
  private _loan?: number;
  private _expiring30?: number;
  private _expiring60?: number;
  private _expiring90?: number;
  private _expired?: number;

  get equipment(): number {
    if (this._equipment === undefined) throw new Error("JsonApi error: analytic equipment is missing");
    return this._equipment;
  }

  get loan(): number {
    if (this._loan === undefined) throw new Error("JsonApi error: analytic loan is missing");
    return this._loan;
  }

  get expiring30(): number {
    if (this._expiring30 === undefined) throw new Error("JsonApi error: analytic expiring30 is missing");
    return this._expiring30;
  }

  get expiring60(): number {
    if (this._expiring60 === undefined) throw new Error("JsonApi error: analytic expiring60 is missing");
    return this._expiring60;
  }

  get expiring90(): number {
    if (this._expiring90 === undefined) throw new Error("JsonApi error: analytic expiring90 is missing");
    return this._expiring90;
  }

  get expired(): number {
    if (this._expired === undefined) throw new Error("JsonApi error: analytic expired is missing");
    return this._expired;
  }

  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._equipment = data.jsonApi.attributes.equipment;
    this._loan = data.jsonApi.attributes.loan;
    this._expiring30 = data.jsonApi.attributes.expiring30;
    this._expiring60 = data.jsonApi.attributes.expiring60;
    this._expiring90 = data.jsonApi.attributes.expiring90;
    this._expired = data.jsonApi.attributes.expired;

    return this;
  }
}
