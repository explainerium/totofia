import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/api/axios-base-query";
import { tagTypes } from "../tag-types";

// Feature files add endpoints with `baseApi.injectEndpoints`.
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes,
  endpoints: () => ({}),
});
