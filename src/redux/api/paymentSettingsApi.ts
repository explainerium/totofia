import type {
  GatewaySettingsInput,
  OnlineMethod,
} from "@/server/modules/payment/gateway-settings.schema";
import type { AdminGatewaySettings } from "@/server/modules/payment/gateway-settings.service";
import { baseApi } from "./baseApi";

const TAG = { type: "Setting" as const, id: "PAYMENT_GATEWAYS" };

const paymentSettingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGatewaySettings: build.query<AdminGatewaySettings, void>({
      query: () => ({ url: "/admin/settings/payments" }),
      providesTags: [TAG],
    }),
    updateGatewaySettings: build.mutation<AdminGatewaySettings, GatewaySettingsInput>({
      query: (data) => ({ url: "/admin/settings/payments", method: "PUT", data }),
      invalidatesTags: [TAG],
    }),
    testGateway: build.mutation<{ ok: boolean; gatewayUrl: string }, OnlineMethod>({
      query: (provider) => ({
        url: "/admin/settings/payments/test",
        method: "POST",
        data: { provider },
      }),
    }),
  }),
});

export const {
  useGetGatewaySettingsQuery,
  useUpdateGatewaySettingsMutation,
  useTestGatewayMutation,
} = paymentSettingsApi;
