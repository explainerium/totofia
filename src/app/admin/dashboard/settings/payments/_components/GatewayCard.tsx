"use client";

import { Copy, ExternalLink, PlugZap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { isApiError } from "@/lib/api/axios";
import { cn } from "@/lib/utils";
import {
  useTestGatewayMutation,
  useUpdateGatewaySettingsMutation,
} from "@/redux/api/paymentSettingsApi";
import type {
  GatewaySettingsInput,
  OnlineMethod,
} from "@/server/modules/payment/gateway-settings.schema";

export type GatewayFormValues = {
  enabled: boolean;
  live: boolean;
  storeId: string;
  secret: string;
};

type Props = {
  provider: OnlineMethod;
  title: string;
  secretLabel: string;
  settings: { enabled: boolean; live: boolean; storeId: string; secretMasked: string | null };
  callbacks: { label: string; url: string }[];
  callbackHint: string;
  toPayload: (values: GatewayFormValues) => GatewaySettingsInput;
};

export function GatewayCard(props: Props) {
  const { provider, title, secretLabel, settings, callbacks, callbackHint, toPayload } = props;
  const [values, setValues] = useState<GatewayFormValues>({
    enabled: settings.enabled,
    live: settings.live,
    storeId: settings.storeId,
    secret: "",
  });
  const [testUrl, setTestUrl] = useState<string | null>(null);
  const [save, { isLoading: saving }] = useUpdateGatewaySettingsMutation();
  const [test, { isLoading: testing }] = useTestGatewayMutation();
  const set = (patch: Partial<GatewayFormValues>) => setValues((v) => ({ ...v, ...patch }));

  async function onSave(event: FormEvent) {
    event.preventDefault();
    try {
      await save(toPayload(values)).unwrap();
      set({ secret: "" });
      toast.success(`${title} settings saved.`);
    } catch (e) {
      toast.error(isApiError(e) ? e.message : "Save failed.");
    }
  }

  async function onTest() {
    setTestUrl(null);
    try {
      const result = await test(provider).unwrap();
      setTestUrl(result.gatewayUrl);
      toast.success(`${title} accepted the credentials.`);
    } catch (e) {
      toast.error(
        isApiError(e) ? `${title}: ${e.message}` : `${title} did not accept the connection.`,
      );
    }
  }

  const saved = settings.secretMasked;

  return (
    <Panel
      title={
        <span className="flex items-center gap-space-sm">
          {title}
          <Badge variant={settings.enabled ? "default" : "outline"}>
            {settings.enabled ? "enabled" : "disabled"}
          </Badge>
          {settings.enabled ? (
            <Badge variant={settings.live ? "destructive" : "secondary"}>
              {settings.live ? "LIVE" : "sandbox"}
            </Badge>
          ) : null}
        </span>
      }
    >
      <form onSubmit={onSave} className="space-y-space-md">
        <div className="flex items-center justify-between gap-space-md">
          <Label htmlFor={`${provider}-enabled`} className="text-label-md">
            Offer at checkout
          </Label>
          <Switch
            id={`${provider}-enabled`}
            checked={values.enabled}
            onCheckedChange={(enabled) => set({ enabled })}
          />
        </div>

        <div className="space-y-1">
          <span className="text-label-md">Mode</span>
          <div
            role="radiogroup"
            aria-label="Mode"
            className="inline-flex rounded-full bg-surface-container p-space-xs"
          >
            {[
              { live: false, label: "Sandbox (test)" },
              { live: true, label: "Live" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={values.live === option.live}
                onClick={() => set({ live: option.live })}
                className={cn(
                  "rounded-full px-space-md py-1 text-label-md transition-colors",
                  values.live === option.live
                    ? option.live
                      ? "bg-error text-on-error"
                      : "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {values.live ? (
            <p className="text-body-sm text-error">
              Live mode takes real money. Use your live store credentials.
            </p>
          ) : null}
        </div>

        <div className="grid gap-space-md sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`${provider}-store`}>Store ID</Label>
            <Input
              id={`${provider}-store`}
              value={values.storeId}
              onChange={(e) => set({ storeId: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${provider}-secret`}>{secretLabel}</Label>
            <Input
              id={`${provider}-secret`}
              type="password"
              value={values.secret}
              onChange={(e) => set({ secret: e.target.value })}
              placeholder={saved ? `saved ${saved} — leave empty to keep` : "not set"}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onTest}
            disabled={testing || !settings.enabled}
            title={settings.enabled ? undefined : "Save the gateway as enabled first"}
          >
            <PlugZap /> {testing ? "Testing…" : "Test connection"}
          </Button>
          {testUrl ? (
            <a
              href={testUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-body-sm text-primary underline"
            >
              Open test payment page <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
        <p className="text-label-sm text-on-surface-variant">
          The test creates a ৳10 payment session with the saved credentials — nothing is charged
          unless you complete it.
        </p>
      </form>

      <div className="space-y-space-sm border-t border-outline-variant/50 pt-space-md">
        <p className="text-label-md">Callback URLs</p>
        <p className="text-body-sm text-on-surface-variant">{callbackHint}</p>
        <ul className="space-y-1">
          {callbacks.map((c) => (
            <li key={c.label} className="flex items-center gap-space-sm text-body-sm">
              <span className="w-24 shrink-0 text-on-surface-variant">{c.label}</span>
              <code className="min-w-0 flex-1 truncate rounded bg-surface-container px-2 py-1">
                {c.url}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Copy ${c.label}`}
                onClick={() =>
                  navigator.clipboard
                    .writeText(c.url)
                    .then(() => toast.success(`${c.label} copied.`))
                }
              >
                <Copy />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
