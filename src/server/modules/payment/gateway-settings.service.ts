import "server-only";
import { cache } from "react";
import { siteUrl } from "@/lib/site-url";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { decryptSecret, encryptSecret, maskSecret } from "../../lib/secret-box";
import type { GatewaySettingsInput, OnlineMethod } from "./gateway-settings.schema";

// Gateway credentials live in the database (Admin → Settings → Payments), not in env, so staff can
// switch sandbox → live without a deploy. Secrets are AES-GCM encrypted (CREDENTIALS_KEY).

const KEY = "payment_gateways";

type StoredGateway = { enabled: boolean; live: boolean; storeId: string; secret: string | null };
type Stored = { sslcommerz: StoredGateway; aamarpay: StoredGateway };

const EMPTY: StoredGateway = { enabled: false, live: false, storeId: "", secret: null };

async function readStored(): Promise<Stored> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const value = (row?.value ?? {}) as Partial<Stored>;
  return {
    sslcommerz: { ...EMPTY, ...value.sslcommerz },
    aamarpay: { ...EMPTY, ...value.aamarpay },
  };
}

export type GatewayConfig = { live: boolean; storeId: string; secret: string };

const field = { SSLCOMMERZ: "sslcommerz", AAMARPAY: "aamarpay" } as const;

/** Decrypted credentials of an enabled, complete gateway — or null. Cached per request. */
export const getGatewayConfig = cache(
  async (method: OnlineMethod): Promise<GatewayConfig | null> => {
    const g = (await readStored())[field[method]];
    if (!g.enabled || !g.storeId || !g.secret) return null;
    try {
      return { live: g.live, storeId: g.storeId, secret: decryptSecret(g.secret) };
    } catch {
      return null; // wrong/rotated CREDENTIALS_KEY — treat as not configured
    }
  },
);

/** Online methods customers can choose right now. */
export async function enabledOnlineMethods(): Promise<OnlineMethod[]> {
  const methods: OnlineMethod[] = [];
  if (await getGatewayConfig("SSLCOMMERZ")) methods.push("SSLCOMMERZ");
  if (await getGatewayConfig("AAMARPAY")) methods.push("AAMARPAY");
  return methods;
}

/** Admin view: never returns secrets, only whether one is saved (masked). */
export async function getGatewaySettingsForAdmin() {
  const stored = await readStored();
  const view = (g: StoredGateway) => {
    let masked: string | null = null;
    if (g.secret) {
      try {
        masked = maskSecret(decryptSecret(g.secret));
      } catch {
        masked = "unreadable — re-enter";
      }
    }
    return { enabled: g.enabled, live: g.live, storeId: g.storeId, secretMasked: masked };
  };
  const cb = (path: string) => siteUrl(`/api/payments/${path}`);
  return {
    sslcommerz: {
      ...view(stored.sslcommerz),
      callbacks: {
        ipn: cb("sslcommerz/ipn"),
        success: cb("sslcommerz/success"),
        fail: cb("sslcommerz/fail"),
        cancel: cb("sslcommerz/cancel"),
      },
    },
    aamarpay: {
      ...view(stored.aamarpay),
      callbacks: {
        success: cb("aamarpay/success"),
        fail: cb("aamarpay/fail"),
        cancel: cb("aamarpay/cancel"),
      },
    },
    credentialsKeySet: Boolean(
      process.env.CREDENTIALS_KEY && process.env.CREDENTIALS_KEY.length >= 32,
    ),
  };
}

export type AdminGatewaySettings = Awaited<ReturnType<typeof getGatewaySettingsForAdmin>>;

export async function updateGatewaySettings(input: GatewaySettingsInput) {
  const stored = await readStored();
  const merge = (
    current: StoredGateway,
    next: { enabled: boolean; live: boolean; storeId: string },
    newSecret: string,
  ): StoredGateway => {
    const secret = newSecret ? encryptSecret(newSecret) : current.secret;
    if (next.enabled && (!next.storeId || !secret)) {
      throw new ApiError(400, "gatewayIncomplete");
    }
    return { enabled: next.enabled, live: next.live, storeId: next.storeId, secret };
  };
  const value: Stored = {
    sslcommerz: merge(stored.sslcommerz, input.sslcommerz, input.sslcommerz.storePassword),
    aamarpay: merge(stored.aamarpay, input.aamarpay, input.aamarpay.signatureKey),
  };
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value, isPublic: false },
    update: { value },
  });
  return getGatewaySettingsForAdmin();
}
