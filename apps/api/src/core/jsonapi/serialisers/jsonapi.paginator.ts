import * as qs from "qs";
import { JsonApiCursorInterface } from "src/core/jsonapi/interfaces/jsonapi.cursor.interface";
import { JsonApiPaginationInterface } from "src/core/jsonapi/interfaces/jsonapi.pagination.interface";
import { JsonApiIncludedFields } from "src/core/jsonapi/types/JsonApiIncludedFields";

export class JsonApiPaginator {
  private _paginationCount = 25;
  private _pagination: JsonApiPaginationInterface = {
    size: this._paginationCount,
    offset: 0,
    offsetNext: undefined,
    offsetPrevious: undefined,
    forcedNext: undefined,
  };
  private _additionalParams: string = "";

  private _includedType: string[] = [];
  private _includedFields: JsonApiIncludedFields[] = [];

  constructor(query?: any) {
    if (!query) return;

    const parsedQuery = qs.parse(query);

    if (parsedQuery?.include) {
      parsedQuery.include.split(",").forEach((type: string) => {
        this._includedType.push(type);
      });
    }

    if (parsedQuery?.fields) {
      Object.entries(parsedQuery.fields).forEach(([key, value]: [string, unknown]) => {
        this._includedFields.push({ type: key, fields: (value as string).split(",") });
      });
    }

    if (parsedQuery.page?.size) this._pagination.size = +parsedQuery.page.size;
    if (parsedQuery.page?.offset) this._pagination.offset = +parsedQuery.page.offset;
    if (parsedQuery.page?.forcedNext) this._pagination.forcedNext = parsedQuery.page.forcedNext;

    this._additionalParams = Object.keys(query)
      .filter(
        (key) =>
          key !== "page[size]" &&
          key !== "page[offset]" &&
          key !== "page[before]" &&
          key !== "page[after]" &&
          (typeof query[key] !== "object" || query[key] === null),
      )
      .map((key) => `${key}=${query[key]}`)
      .join("&");

    if (this._additionalParams.length > 0) this._additionalParams = "&" + this._additionalParams;
  }

  set forceNext(forceNext: string) {
    this._pagination.forcedNext = forceNext;
  }

  generateLinks(data: any[], url: string): { self: string; next?: string; previous?: string } {
    const response = {
      self: "",
      next: undefined,
      previous: undefined,
    };

    this.updatePagination(data);
    if (!this._pagination.size) this._pagination.size = this._paginationCount;

    if (data.length === this.size) {
      const urlSelf = new URL(url);
      urlSelf.searchParams.set("page[size]", this._pagination.size.toString());
      urlSelf.searchParams.delete("page[offset]");
      response.self = urlSelf.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");

      if (this._additionalParams) response.self += this._additionalParams;

      if (this._pagination.forcedNext) {
        const urlNext = new URL(url);
        urlNext.searchParams.set("page[size]", this._pagination.size.toString());
        urlNext.searchParams.set("page[offset]", this._pagination.forcedNext);
        response.next = urlNext.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
        if (this._additionalParams) response.next += this._additionalParams;
      } else if (this._pagination.offsetNext) {
        const urlNext = new URL(url);
        urlNext.searchParams.set("page[size]", this._pagination.size.toString());
        urlNext.searchParams.set("page[offset]", this._pagination.offsetNext.toString());
        response.next = urlNext.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
        if (this._additionalParams) response.next += this._additionalParams;
      }

      data.splice(this._pagination.size, 1);
    }

    if (this._pagination.offsetPrevious) {
      const urlPrev = new URL(url);
      urlPrev.searchParams.set("page[size]", this._pagination.size.toString());
      urlPrev.searchParams.set("page[offset]", (this._pagination.offset - this._pagination.size).toString());
      response.previous = urlPrev.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
      if (this._additionalParams) response.previous += this._additionalParams;
    }

    return response;
  }

  updatePagination(data: any[]): void {
    const hasEnoughData = data.length === this.size;

    if (!this._pagination.forcedNext) {
      if (hasEnoughData) this._pagination.offsetNext = (this._pagination.offset ?? 0) + data.length - 1;
      if (this._pagination.offset) this._pagination.offsetPrevious = this._pagination.offset - this.size;
    }
  }

  get paginationCount(): number {
    return this._paginationCount;
  }

  get size(): number {
    return (this._pagination?.size ?? this._paginationCount) + 1;
  }

  get pagination(): JsonApiPaginationInterface {
    return this._pagination;
  }

  get includedFields(): JsonApiIncludedFields[] {
    return this._includedFields;
  }

  get includedType(): string[] {
    return this._includedType;
  }

  generateCursor(): JsonApiCursorInterface {
    const cursor: JsonApiCursorInterface = {
      cursor: this._pagination.offset,
      take: this.size,
    };

    return cursor;
  }
}
