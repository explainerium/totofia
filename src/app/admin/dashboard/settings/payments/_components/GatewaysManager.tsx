"use client";

import { ShieldAlert } from "lucide-react";
import { useAdminUser } from "@/components/dashboard/AdminUserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetGatewaySettingsQuery } from "@/redux/api/paymentSettingsApi";
import type { GatewaySettingsInput } from "@/server/modules/payment/gateway-settings.schema";
import { GatewayCard, type GatewayFormValues } from "./GatewayCard";

type Key = keyof GatewaySettingsInput;

export function GatewaysManager() {
  const { isAdmin } = useAdminUser();
  const { data, isError } = useGetGatewaySettingsQuery(undefined, { skip: !isAdmin });

  if (!isAdmin) {
    return (
      <p className="rounded-lg bg-surface-container p-space-md text-body-md">
        Only an ADMIN can view or change payment gateway credentials.
      </p>
    );
  }
  if (isError) return <p>Could not load payment settings.</p>;
  if (!data) return <Skeleton className="h-96 w-full" />;

  /** PUT always sends both gateways; the other one keeps its saved secret (empty = keep). */
  const payload = (key: Key, values: GatewayFormValues): GatewaySettingsInput => {
    const current = {
      sslcommerz: {
        enabled: data.sslcommerz.enabled,
        live: data.sslcommerz.live,
        storeId: data.sslcommerz.storeId,
        storePassword: "",
      },
      aamarpay: {
        enabled: data.aamarpay.enabled,
        live: data.aamarpay.live,
        storeId: data.aamarpay.storeId,
        signatureKey: "",
      },
    };
    const base = { enabled: values.enabled, live: values.live, storeId: values.storeId.trim() };
    return key === "sslcommerz"
      ? { ...current, sslcommerz: { ...base, storePassword: values.secret.trim() } }
      : { ...current, aamarpay: { ...base, signatureKey: values.secret.trim() } };
  };

  return (
    <div className="space-y-space-lg">
      {!data.credentialsKeySet ? (
        <div className="flex items-start gap-space-sm rounded-xl border border-error/40 bg-error-container p-space-md text-on-error-container">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <p className="text-body-sm">
            <strong>CREDENTIALS_KEY is not set on the server.</strong> Gateway secrets cannot be
            saved or read until it is configured (32+ random characters). Changing it later makes
            saved secrets unreadable — re-enter them here.
          </p>
        </div>
      ) : null}
      <p className="text-body-sm text-on-surface-variant">
        Start in <strong>Sandbox</strong> with the test credentials from the gateway&apos;s
        developer/sandbox account. Switch a gateway to <strong>Live</strong> only after entering its
        live credentials. Customers see every enabled gateway at checkout.
      </p>
      <div className="grid gap-space-lg xl:grid-cols-2">
        <GatewayCard
          provider="SSLCOMMERZ"
          title="SSLCommerz"
          secretLabel="Store password"
          settings={data.sslcommerz}
          callbacks={[
            { label: "IPN URL", url: data.sslcommerz.callbacks.ipn },
            { label: "Success URL", url: data.sslcommerz.callbacks.success },
            { label: "Fail URL", url: data.sslcommerz.callbacks.fail },
            { label: "Cancel URL", url: data.sslcommerz.callbacks.cancel },
          ]}
          callbackHint="Paste the IPN URL in the SSLCommerz merchant panel (My Stores → IPN settings). The other URLs are sent automatically with every payment."
          toPayload={(v) => payload("sslcommerz", v)}
        />
        <GatewayCard
          provider="AAMARPAY"
          title="aamarPay"
          secretLabel="Signature key"
          settings={data.aamarpay}
          callbacks={[
            { label: "Success URL", url: data.aamarpay.callbacks.success },
            { label: "Fail URL", url: data.aamarpay.callbacks.fail },
            { label: "Cancel URL", url: data.aamarpay.callbacks.cancel },
          ]}
          callbackHint="These URLs are sent with every payment. If aamarPay asks for them when activating your store, paste them in the merchant panel."
          toPayload={(v) => payload("aamarpay", v)}
        />
      </div>
    </div>
  );
}
