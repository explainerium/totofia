import type { Dashboard } from "@/server/modules/dashboard/dashboard.service";
import type { StoreSettings } from "@/server/modules/setting/setting.schema";
import { baseApi } from "./baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<Dashboard, void>({
      query: () => ({ url: "/admin/dashboard" }),
      providesTags: ["Dashboard"],
    }),
    getSettings: build.query<StoreSettings, void>({
      query: () => ({ url: "/admin/settings" }),
      providesTags: ["Setting"],
    }),
    updateSettings: build.mutation<StoreSettings, StoreSettings>({
      query: (data) => ({ url: "/admin/settings", method: "PUT", data }),
      invalidatesTags: ["Setting"],
    }),
    sendTestEmail: build.mutation<{ smtpConfigured: boolean }, { to: string }>({
      query: (data) => ({ url: "/admin/settings/test-email", method: "POST", data }),
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useSendTestEmailMutation,
} = dashboardApi;
