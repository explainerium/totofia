import type {
  AttributeInput,
  AttributeValueInput,
} from "@/server/modules/attribute/attribute.schema";
import type { AdminAttribute } from "@/server/modules/attribute/attribute.service";
import { baseApi } from "./baseApi";

const LIST = { type: "Attribute" as const, id: "LIST" };

type ValueArgs = { attributeId: string; valueId: string };

const attributeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAttributes: build.query<AdminAttribute[], void>({
      query: () => ({ url: "/admin/attributes" }),
      providesTags: [LIST],
    }),
    createAttribute: build.mutation<AdminAttribute, AttributeInput>({
      query: (data) => ({ url: "/admin/attributes", method: "POST", data }),
      invalidatesTags: [LIST],
    }),
    updateAttribute: build.mutation<AdminAttribute, { id: string; data: AttributeInput }>({
      query: ({ id, data }) => ({ url: `/admin/attributes/${id}`, method: "PUT", data }),
      invalidatesTags: [LIST],
    }),
    deleteAttribute: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/attributes/${id}`, method: "DELETE" }),
      invalidatesTags: [LIST],
    }),
    createAttributeValue: build.mutation<
      AdminAttribute,
      { attributeId: string; data: AttributeValueInput }
    >({
      query: ({ attributeId, data }) => ({
        url: `/admin/attributes/${attributeId}/values`,
        method: "POST",
        data,
      }),
      invalidatesTags: [LIST],
    }),
    updateAttributeValue: build.mutation<AdminAttribute, ValueArgs & { data: AttributeValueInput }>(
      {
        query: ({ attributeId, valueId, data }) => ({
          url: `/admin/attributes/${attributeId}/values/${valueId}`,
          method: "PUT",
          data,
        }),
        invalidatesTags: [LIST],
      },
    ),
    deleteAttributeValue: build.mutation<AdminAttribute, ValueArgs>({
      query: ({ attributeId, valueId }) => ({
        url: `/admin/attributes/${attributeId}/values/${valueId}`,
        method: "DELETE",
      }),
      invalidatesTags: [LIST],
    }),
  }),
});

export const {
  useGetAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} = attributeApi;
