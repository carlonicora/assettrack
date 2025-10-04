import { DataBootstrapper } from "@/data/DataBootstrapper";
import { DataClass } from "@/jsonApi/DataClass";
import { JsonApiDataFactory } from "@/jsonApi/factories/JsonApiDataFactory";
import { ApiData } from "@/jsonApi/interfaces/ApiData";
import { ApiDataInterface } from "@/jsonApi/interfaces/ApiDataInterface";
import { ApiRequestDataTypeInterface } from "@/jsonApi/interfaces/ApiRequestDataTypeInterface";
import { ApiResponseInterface } from "@/jsonApi/interfaces/ApiResponseInterface";
import { JsonApiServerRequest } from "./JsonApiServerRequest";

export function translateData<T extends ApiDataInterface>(params: {
  classKey: ApiRequestDataTypeInterface;
  data: any;
}): T | T[] {
  DataBootstrapper.bootstrap();
  const factoryClass = DataClass.get(params.classKey);

  if (!factoryClass) {
    throw new Error(
      `Class not registered for key: ${typeof params.classKey === "string" ? params.classKey : params.classKey.name}`,
    );
  }

  const included: any = params.data.included ?? [];

  if (Array.isArray(params.data.data)) {
    const responseData: T[] = [];

    for (const data of params.data.data) {
      const object = new factoryClass();
      object.rehydrate({ jsonApi: data, included: included });
      responseData.push(object as T);
    }

    return responseData as T[];
  } else {
    const responseData = new factoryClass();
    responseData.rehydrate({
      jsonApi: params.data.data,
      included: included,
    });

    return responseData as T;
  }
}

export async function translateResponse<T extends ApiDataInterface>(params: {
  classKey: ApiRequestDataTypeInterface;
  apiResponse: ApiData;
  companyId?: string;
  language: string;
}): Promise<ApiResponseInterface> {
  DataBootstrapper.bootstrap();
  const response: ApiResponseInterface = {
    ok: true,
    response: 0,
    data: [],
    error: "",
  };

  const factoryClass = DataClass.get(params.classKey);

  if (!factoryClass) {
    throw new Error(
      `Class not registered for key: ${typeof params.classKey === "string" ? params.classKey : params.classKey.name}`,
    );
  }

  response.ok = params.apiResponse.ok;
  response.response = params.apiResponse.status;

  if (!params.apiResponse.ok) {
    response.error = params.apiResponse?.data?.message ?? params.apiResponse.statusText;
    return response;
  }

  if (params.apiResponse.status === 204) return response;

  response.raw = params.apiResponse.data;

  try {
    const included: any = params.apiResponse.data.included ?? [];

    if (params.apiResponse.data.links) {
      response.self = params.apiResponse.data.links.self;

      if (params.apiResponse.data.links.next) {
        response.next = params.apiResponse.data.links.next;
        response.nextPage = async () =>
          JsonApiGet({
            classKey: params.classKey,
            endpoint: params.apiResponse.data.links.next,
            companyId: params?.companyId,
            language: params.language,
          });
      }

      if (params.apiResponse.data.links.prev) {
        response.prev = params.apiResponse.data.links.prev;
        response.prevPage = async () =>
          JsonApiGet({
            classKey: params.classKey,
            endpoint: params.apiResponse.data.links.prev,
            companyId: params?.companyId,
            language: params.language,
          });
      }
    }

    if (Array.isArray(params.apiResponse.data.data)) {
      const responseData: T[] = [];

      for (const data of params.apiResponse.data.data) {
        const object = new factoryClass();
        object.rehydrate({ jsonApi: data, included: included });
        responseData.push(object as T);
      }

      response.data = responseData;
    } else {
      const responseData = new factoryClass();
      responseData.rehydrate({
        jsonApi: params.apiResponse.data.data,
        included: included,
      });

      response.data = responseData;
    }
  } catch (e) {
    console.error(e);
  }

  return response;
}

async function getToken(): Promise<string | undefined> {
  let response: string | undefined;
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    response = cookieStore.get("token")?.value;
  } else {
    const { getCookie } = await import("cookies-next");
    response = await getCookie("token");
  }

  return response;
}

export async function JsonApiGet(params: {
  classKey: ApiRequestDataTypeInterface;
  endpoint: string;
  companyId?: string;
  language: string;
}): Promise<ApiResponseInterface> {
  const token = await getToken();

  const apiResponse: ApiData = await JsonApiServerRequest({
    detail: "GET",
    link: `${params.endpoint.startsWith("http") ? "" : process.env.NEXT_PUBLIC_API_URL}${params.endpoint}`,
    cache: params.classKey.cache,
    companyId: params.companyId,
    language: params.language,
    token: token,
  });

  return translateResponse({
    classKey: params.classKey,
    apiResponse: apiResponse,
    companyId: params.companyId,
    language: params.language,
  });
}

export async function JsonApiPost(params: {
  classKey: ApiRequestDataTypeInterface;
  endpoint: string;
  companyId?: string;
  body?: any;
  overridesJsonApiCreation?: boolean;
  files?: { [key: string]: File | Blob } | File | Blob;
  language: string;
  responseType?: ApiRequestDataTypeInterface;
}): Promise<ApiResponseInterface> {
  const token = await getToken();
  DataBootstrapper.bootstrap();

  if (!params.body) params.body = {};
  else if (params.overridesJsonApiCreation !== true)
    params.body = JsonApiDataFactory.create(params.classKey, params.body);

  const apiResponse: ApiData = await JsonApiServerRequest({
    detail: "POST",
    link: `${params.endpoint.startsWith("http") ? "" : process.env.NEXT_PUBLIC_API_URL}${params.endpoint}`,
    companyId: params.companyId,
    body: params.body,
    files: params.files,
    language: params.language,
    token: token,
  });

  return translateResponse({
    classKey: params.responseType ?? params.classKey,
    apiResponse: apiResponse,
    companyId: params.companyId,
    language: params.language,
  });
}

export async function JsonApiPut(params: {
  classKey: ApiRequestDataTypeInterface;
  endpoint: string;
  companyId?: string;
  body?: any;
  files?: { [key: string]: File | Blob } | File | Blob;
  language: string;
  responseType?: ApiRequestDataTypeInterface;
}): Promise<ApiResponseInterface> {
  const token = await getToken();
  DataBootstrapper.bootstrap();

  if (!params.body) params.body = {};
  else params.body = JsonApiDataFactory.create(params.classKey, params.body);

  const apiResponse: ApiData = await JsonApiServerRequest({
    detail: "PUT",
    link: `${params.endpoint.startsWith("http") ? "" : process.env.NEXT_PUBLIC_API_URL}${params.endpoint}`,
    companyId: params.companyId,
    body: params.body,
    files: params.files,
    language: params.language,
    token: token,
  });

  return translateResponse({
    classKey: params.responseType ?? params.classKey,
    apiResponse: apiResponse,
    companyId: params.companyId,
    language: params.language,
  });
}

export async function JsonApiPatch(params: {
  classKey: ApiRequestDataTypeInterface;
  endpoint: string;
  companyId?: string;
  body?: any;
  files?: { [key: string]: File | Blob } | File | Blob;
  overridesJsonApiCreation?: boolean;
  responseType?: ApiRequestDataTypeInterface;
  language: string;
}): Promise<ApiResponseInterface> {
  const token = await getToken();
  DataBootstrapper.bootstrap();

  if (!params.body) params.body = {};
  else if (params.overridesJsonApiCreation !== true)
    params.body = JsonApiDataFactory.create(params.classKey, params.body);

  const apiResponse: ApiData = await JsonApiServerRequest({
    detail: "PATCH",
    link: `${params.endpoint.startsWith("http") ? "" : process.env.NEXT_PUBLIC_API_URL}${params.endpoint}`,
    companyId: params.companyId,
    body: params.body,
    files: params.files,
    language: params.language,
    token: token,
  });

  return translateResponse({
    classKey: params.responseType ?? params.classKey,
    apiResponse: apiResponse,
    companyId: params.companyId,
    language: params.language,
  });
}

export async function JsonApiDelete(params: {
  classKey: ApiRequestDataTypeInterface;
  endpoint: string;
  companyId?: string;
  language: string;
  responseType?: ApiRequestDataTypeInterface;
}): Promise<ApiResponseInterface> {
  const token = await getToken();
  const apiResponse: ApiData = await JsonApiServerRequest({
    detail: "DELETE",
    link: `${params.endpoint.startsWith("http") ? "" : process.env.NEXT_PUBLIC_API_URL}${params.endpoint}`,
    companyId: params.companyId,
    language: params.language,
    token: token,
  });

  return translateResponse({
    classKey: params.responseType ?? params.classKey,
    apiResponse: apiResponse,
    companyId: params.companyId,
    language: params.language,
  });
}
