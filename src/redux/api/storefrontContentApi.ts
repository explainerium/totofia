import { baseApi } from "./baseApi";

export type ContactPayload = {
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  /** Honeypot — always empty for people. */
  website?: string;
};

const storefrontContentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendContactMessage: build.mutation<null, ContactPayload>({
      query: (data) => ({ url: "/contact", method: "POST", data }),
    }),
    subscribeNewsletter: build.mutation<null, { email: string }>({
      query: (data) => ({ url: "/newsletter", method: "POST", data }),
    }),
  }),
});

export const { useSendContactMessageMutation, useSubscribeNewsletterMutation } =
  storefrontContentApi;
