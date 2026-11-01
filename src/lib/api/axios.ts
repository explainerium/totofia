import axios, { isAxiosError } from "axios";
import type { PaginationMeta } from "@/server/http/response";

export type ApiMeta = PaginationMeta;

/** Normalized error every API call rejects with. */
export type ApiErrorShape = {
  statusCode: number;
  message: string;
  details?: { path: string; message: string }[];
};

export const api = axios.create({ baseURL: "/api/v1" });

// The API answers in the page language; admin pages render with <html lang="en">.
api.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    config.headers.set("x-locale", document.documentElement.lang === "bn" ? "bn" : "en");
  }
  return config;
});

// `{ success, data, meta }` → `{ data, meta }`; errors → ApiErrorShape.
api.interceptors.response.use(
  (response) => {
    const body = response.data ?? {};
    response.data = { data: body.data ?? null, meta: body.meta };
    return response;
  },
  (error) => Promise.reject(normalizeError(error)),
);

export function normalizeError(error: unknown): ApiErrorShape {
  if (isAxiosError(error)) {
    const body = error.response?.data as Partial<ApiErrorShape> | undefined;
    return {
      statusCode: error.response?.status ?? 0,
      message: body?.message ?? error.message,
      details: body?.details,
    };
  }
  if (isApiError(error)) return error;
  return { statusCode: 0, message: error instanceof Error ? error.message : "Unknown error" };
}

export function isApiError(value: unknown): value is ApiErrorShape {
  return typeof value === "object" && value !== null && "statusCode" in value && "message" in value;
}
