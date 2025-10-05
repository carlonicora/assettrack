"use server";

import { DataBootstrapper } from "@/data/DataBootstrapper";
import { ApiData } from "@/jsonApi/interfaces/ApiData";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function JsonApiServerRequest(params: {
  detail: string;
  link: string;
  token?: string;
  cache?: string;
  body?: any;
  files?: { [key: string]: File | Blob } | File | Blob;
  companyId?: string;
  language: string;
}): Promise<ApiData> {
  "use cache";
  DataBootstrapper.bootstrap();

  const response: ApiData = {
    data: undefined,
    ok: false,
    status: 0,
    statusText: "",
  };

  if (params.cache) {
    if (["days", "default", "hours", "max", "minutes", "seconds", "weeks"].includes(params.cache))
      cacheLife(params.cache);
    else cacheTag(params.cache);
  } else {
    cacheLife("seconds");
  }

  const additionalHeaders: any = {};

  if (params.companyId) additionalHeaders["x-companyid"] = params.companyId;
  additionalHeaders["x-language"] = params.language;

  let requestBody: BodyInit | undefined = undefined;

  if (params.files) {
    const formData = new FormData();
    if (params.body && typeof params.body === "object") {
      for (const key in params.body) {
        if (Object.prototype.hasOwnProperty.call(params.body, key)) {
          formData.append(
            key,
            typeof params.body[key] === "object" ? JSON.stringify(params.body[key]) : params.body[key],
          );
        }
      }
    }

    if (params.files instanceof Blob) {
      formData.append("file", params.files);
    } else if (typeof params.files === "object" && params.files !== null) {
      for (const key in params.files) {
        if (params.files.hasOwnProperty(key)) {
          formData.append(key, params.files[key]);
        }
      }
    }

    requestBody = formData;
  } else if (params.body !== undefined) {
    requestBody = JSON.stringify(params.body);
    additionalHeaders["Content-Type"] = "application/json";
  }

  const options: RequestInit = { method: params.detail, headers: { Accept: "application/json", ...additionalHeaders } };

  if (requestBody !== undefined) options.body = requestBody;

  if (params.token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${params.token}` };
  }

  try {
    const apiResponse = await fetch(params.link, options);

    response.ok = apiResponse.ok;
    response.status = apiResponse.status;
    response.statusText = apiResponse.statusText;
    try {
      response.data = await apiResponse.json();
    } catch (error) {
      response.data = undefined;
    }
  } catch (error) {
    response.ok = false;
    response.status = 500;
    response.data = undefined;
  }
  return response;
}
