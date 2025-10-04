import { ApiRequestDataTypeInterface } from "@/jsonApi/interfaces/ApiRequestDataTypeInterface";
import { ApiResponseInterface } from "@/jsonApi/interfaces/ApiResponseInterface";
import { JsonApiDelete, JsonApiGet, JsonApiPatch, JsonApiPost, JsonApiPut } from "@/jsonApi/JsonApiRequest";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface NextRef {
  next?: string;
}

export interface PreviousRef {
  previous?: string;
}

let globalErrorHandler: ((status: number, message: string) => void) | null = null;

export function setGlobalErrorHandler(handler: (status: number, message: string) => void) {
  globalErrorHandler = handler;
}

export abstract class AbstractService {
  static async next<T>(params: {
    type: ApiRequestDataTypeInterface;
    endpoint: string;
    next?: NextRef;
    previous?: PreviousRef;
  }): Promise<T> {
    return await this.callApi<T>({
      method: HttpMethod.GET,
      type: params.type,
      endpoint: params.endpoint,
      next: params.next,
      previous: params.previous,
    });
  }

  static async previous<T>(params: {
    type: ApiRequestDataTypeInterface;
    endpoint: string;
    next?: NextRef;
    previous?: PreviousRef;
  }): Promise<T> {
    return await this.callApi<T>({
      method: HttpMethod.GET,
      type: params.type,
      endpoint: params.endpoint,
      next: params.next,
      previous: params.previous,
    });
  }

  protected static async callApi<T>(params: {
    type: ApiRequestDataTypeInterface;
    method: HttpMethod;
    endpoint: string;
    companyId?: string;
    input?: any;
    overridesJsonApiCreation?: boolean;
    next?: NextRef;
    previous?: PreviousRef;
    responseType?: ApiRequestDataTypeInterface;
    files?: { [key: string]: File | Blob } | File | Blob;
  }): Promise<T> {
    let apiResponse: ApiResponseInterface;

    let language = "it";

    if (typeof window === "undefined") {
      const { getLocale } = await import("next-intl/server");
      language = (await getLocale()) ?? "it";
    } else {
      language = navigator.language.split("-")[0] || "it";
    }

    switch (params.method) {
      case HttpMethod.GET:
        apiResponse = await JsonApiGet({
          classKey: params.type,
          endpoint: params.endpoint,
          companyId: params.companyId,
          language: language,
        });
        break;
      case HttpMethod.POST:
        apiResponse = await JsonApiPost({
          classKey: params.type,
          endpoint: params.endpoint,
          companyId: params.companyId,
          body: params.input,
          overridesJsonApiCreation: params.overridesJsonApiCreation,
          language: language,
          responseType: params.responseType,
          files: params.files,
        });
        break;
      case HttpMethod.PUT:
        apiResponse = await JsonApiPut({
          classKey: params.type,
          endpoint: params.endpoint,
          companyId: params.companyId,
          body: params.input,
          language: language,
          responseType: params.responseType,
          files: params.files,
        });
        break;
      case HttpMethod.PATCH:
        apiResponse = await JsonApiPatch({
          classKey: params.type,
          endpoint: params.endpoint,
          companyId: params.companyId,
          body: params.input,
          overridesJsonApiCreation: params.overridesJsonApiCreation,
          language: language,
          responseType: params.responseType,
          files: params.files,
        });
        break;
      case HttpMethod.DELETE:
        apiResponse = await JsonApiDelete({
          classKey: params.type,
          endpoint: params.endpoint,
          companyId: params.companyId,
          language: language,
          responseType: params.responseType,
        });
        break;
      default:
        throw new Error("Method not found");
    }

    if (!apiResponse.ok) {
      if (globalErrorHandler && typeof window !== "undefined") {
        globalErrorHandler(apiResponse.response, apiResponse.error);
        return undefined as any;
      } else {
        const error = new Error(`${apiResponse.response}:${apiResponse.error}`) as any;
        error.status = apiResponse.response;
        error.digest = `HTTP_${apiResponse.response}`;
        throw error;
      }
    }

    if (apiResponse.next && params.next) params.next.next = apiResponse.next;
    if (apiResponse.prev && params.previous) params.previous.previous = apiResponse.prev;

    return apiResponse.data as T;
  }

  protected static async getRawData(params: {
    type: ApiRequestDataTypeInterface;
    method: HttpMethod;
    endpoint: string;
    companyId?: string;
  }): Promise<any> {
    let language = "it";

    if (typeof window === "undefined") {
      const { getLocale } = await import("next-intl/server");
      language = (await getLocale()) ?? "it";
    } else {
      language = navigator.language.split("-")[0] || "it";
    }

    const apiResponse: ApiResponseInterface = await JsonApiGet({
      classKey: params.type,
      endpoint: params.endpoint,
      companyId: params.companyId,
      language: language,
    });

    if (!apiResponse.ok) {
      if (globalErrorHandler && typeof window !== "undefined") {
        globalErrorHandler(apiResponse.response, apiResponse.error);
        return undefined as any;
      } else {
        const error = new Error(`${apiResponse.response}:${apiResponse.error}`) as any;
        error.status = apiResponse.response;
        error.digest = `HTTP_${apiResponse.response}`;
        throw error;
      }
    }

    return apiResponse.raw;
  }
}
