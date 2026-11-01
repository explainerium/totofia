import type { ApiMeta } from "@/lib/api/axios";
import type { AdminContactMessage } from "@/server/modules/content/inbox.service";
import type { AdminReview } from "@/server/modules/review/review.service";
import { baseApi } from "./baseApi";

type Status = AdminContactMessage["status"];
type ReviewStatus = AdminReview["status"];

export type Subscriber = {
  id: string;
  email: string;
  locale: "bn" | "en";
  createdAt: string;
  unsubscribedAt: string | null;
};

type MessageList = { items: AdminContactMessage[]; unread: number; meta?: ApiMeta };
type ReviewList = { items: AdminReview[]; pending: number; meta?: ApiMeta };
type SubscriberList = { items: Subscriber[]; meta?: ApiMeta };

const MESSAGES = { type: "Message" as const, id: "LIST" };
const SUBSCRIBERS = { type: "Subscriber" as const, id: "LIST" };
const REVIEWS = { type: "Review" as const, id: "LIST" };

const inboxApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMessages: build.query<
      MessageList,
      { status?: Status | "INBOX"; page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/messages", params }),
      transformResponse: (data: { items: AdminContactMessage[]; unread: number }, meta) => ({
        ...data,
        meta: meta?.pagination,
      }),
      providesTags: [MESSAGES],
    }),
    setMessageStatus: build.mutation<null, { id: string; status: Status }>({
      query: ({ id, status }) => ({
        url: `/admin/messages/${id}`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [MESSAGES],
    }),
    deleteMessage: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/messages/${id}`, method: "DELETE" }),
      invalidatesTags: [MESSAGES],
    }),
    getSubscribers: build.query<SubscriberList, { q?: string; page?: number; limit?: number }>({
      query: (params) => ({ url: "/admin/newsletter", params }),
      transformResponse: (items: Subscriber[], meta) => ({ items, meta: meta?.pagination }),
      providesTags: [SUBSCRIBERS],
    }),
    unsubscribe: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/newsletter/${id}`, method: "DELETE" }),
      invalidatesTags: [SUBSCRIBERS],
    }),
    getReviews: build.query<ReviewList, { status?: ReviewStatus; page?: number; limit?: number }>({
      query: (params) => ({ url: "/admin/reviews", params }),
      transformResponse: (data: { items: AdminReview[]; pending: number }, meta) => ({
        ...data,
        meta: meta?.pagination,
      }),
      providesTags: [REVIEWS],
    }),
    setReviewStatus: build.mutation<null, { id: string; status: ReviewStatus }>({
      query: ({ id, status }) => ({
        url: `/admin/reviews/${id}`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [REVIEWS],
    }),
    deleteReview: build.mutation<null, string>({
      query: (id) => ({ url: `/admin/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: [REVIEWS],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSetMessageStatusMutation,
  useDeleteMessageMutation,
  useGetSubscribersQuery,
  useUnsubscribeMutation,
  useGetReviewsQuery,
  useSetReviewStatusMutation,
  useDeleteReviewMutation,
} = inboxApi;
