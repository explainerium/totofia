"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAdminUser } from "@/components/dashboard/AdminUserContext";
import { Panel } from "@/components/dashboard/Panel";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProTextarea } from "@/components/form/ProTextarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/axios";
import {
  useGetSettingsQuery,
  useSendTestEmailMutation,
  useUpdateSettingsMutation,
} from "@/redux/api/dashboardApi";
import { storeSettingsInput, type StoreSettings } from "@/server/modules/setting/setting.schema";

export function SettingsView() {
  const { data, isError } = useGetSettingsQuery();
  const [save] = useUpdateSettingsMutation();
  const { isAdmin } = useAdminUser();

  if (isError) return <p>Could not load settings.</p>;
  if (!data) return <Skeleton className="h-96 w-full" />;

  async function onSubmit(values: StoreSettings) {
    await save(values).unwrap();
    toast.success("Settings saved.");
  }

  return (
    <div className="grid gap-space-lg lg:grid-cols-[1fr_360px]">
      <ProForm schema={storeSettingsInput} defaultValues={data} onSubmit={onSubmit}>
        <fieldset disabled={!isAdmin} className="space-y-space-lg disabled:opacity-80">
          {!isAdmin ? (
            <p className="rounded-lg bg-surface-container p-space-sm text-body-sm">
              Only an ADMIN can change settings. You can view them.
            </p>
          ) : null}
          <Panel
            title="Store contact"
            description="Shown in the store footer, contact page and invoices."
          >
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput name="phone" label="Helpline phone" placeholder="+880 1800-868634" />
              <ProInput name="email" label="Support email" type="email" />
            </div>
            <ProTextarea name="addressEn" label="Address (English)" rows={2} />
            <ProTextarea name="addressBn" label="Address (বাংলা)" lang="bn" rows={2} />
          </Panel>
          <Panel title="Social">
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput
                name="facebookUrl"
                label="Facebook page URL"
                placeholder="https://facebook.com/…"
              />
              <ProInput
                name="instagramUrl"
                label="Instagram URL"
                placeholder="https://instagram.com/…"
              />
              <ProInput
                name="whatsapp"
                label="WhatsApp number"
                placeholder="8801800868634"
                description="Digits only, with country code."
              />
            </div>
          </Panel>
          <Panel title="Checkout">
            <ProInput
              name="maxPendingCodPerPhone"
              label="Max unconfirmed COD orders per phone"
              numeric="number"
              min={1}
              max={20}
              description="Protects against fake orders. Confirming or cancelling an order frees a slot."
            />
          </Panel>
          <Panel title="Analytics" description="Saved now, used when tracking is added in Phase 6.">
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput name="ga4Id" label="Google Analytics 4 ID" placeholder="G-XXXXXXX" />
              <ProInput name="fbPixelId" label="Meta Pixel ID" />
            </div>
          </Panel>
          {isAdmin ? <ProSubmit>Save settings</ProSubmit> : null}
        </fieldset>
      </ProForm>
      <TestEmail />
    </div>
  );
}

function TestEmail() {
  const [to, setTo] = useState("");
  const [send, { isLoading, data }] = useSendTestEmailMutation();

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await send({ to }).unwrap();
      toast.success(
        result.smtpConfigured ? "Test email sent." : "SMTP not configured — logged only.",
      );
    } catch (e) {
      toast.error(isApiError(e) ? e.message : "Sending failed — check the SMTP settings.");
    }
  }

  return (
    <Panel
      title="Email"
      description="Order and password emails use the SMTP_* values in the server environment."
      className="self-start"
    >
      <form onSubmit={submit} className="space-y-space-sm">
        <Input
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" disabled={isLoading}>
          Send test email
        </Button>
      </form>
      {data ? (
        <p
          className={data.smtpConfigured ? "text-body-sm text-primary" : "text-body-sm text-error"}
        >
          {data.smtpConfigured
            ? "SMTP is configured — check the inbox."
            : "SMTP is not configured: emails are only written to the server log."}
        </p>
      ) : null}
    </Panel>
  );
}
