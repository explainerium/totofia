import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import { api, normalizeError, type ApiErrorShape, type ApiMeta } from "./axios";

export type AxiosArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: AxiosRequestConfig["params"];
};

/** RTK Query adapter over the shared axios instance. Pagination meta is passed as query meta. */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosArgs, unknown, ApiErrorShape, object, { pagination?: ApiMeta }> =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const res = await api.request<{ data: unknown; meta?: ApiMeta }>({
        url,
        method,
        data,
        params,
      });
      return { data: res.data.data, meta: { pagination: res.data.meta } };
    } catch (error) {
      return { error: normalizeError(error) };
    }
  };
