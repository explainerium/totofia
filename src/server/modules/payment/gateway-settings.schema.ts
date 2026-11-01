import { z } from "zod";

export const ONLINE_METHODS = ["SSLCOMMERZ", "AAMARPAY"] as const;
export type OnlineMethod = (typeof ONLINE_METHODS)[number];

const storeId = z.string().trim().max(120).default("");
/** Empty = keep the saved secret. */
const secret = z.string().trim().max(300).default("");

export const gatewaySettingsInput = z.object({
  sslcommerz: z.object({
    enabled: z.boolean().default(false),
    live: z.boolean().default(false),
    storeId,
    storePassword: secret,
  }),
  aamarpay: z.object({
    enabled: z.boolean().default(false),
    live: z.boolean().default(false),
    storeId,
    signatureKey: secret,
  }),
});

export type GatewaySettingsInput = z.infer<typeof gatewaySettingsInput>;

export const gatewayTestInput = z.object({ provider: z.enum(ONLINE_METHODS) });
