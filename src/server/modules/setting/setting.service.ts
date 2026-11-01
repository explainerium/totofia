import "server-only";
import { cache } from "react";
import { prisma } from "../../db/prisma";
import { sendMail } from "../../integrations/mail/mailer";
import { storeSettingsInput, type StoreSettings } from "./setting.schema";
import { cached, invalidate, TAGS } from "../../lib/cache";

const KEY = "store";

/** Store settings with defaults filled in. Cached per request. */
const getStoreSettingsDb = async (): Promise<StoreSettings> => {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const parsed = storeSettingsInput.safeParse(row?.value ?? {});
  return parsed.success ? parsed.data : storeSettingsInput.parse({});
};

/** Store settings with defaults filled in. Cached across requests + per request. */
export const getStoreSettings = cache(
  cached(getStoreSettingsDb, "settings:store", [TAGS.settings]),
);

export async function updateStoreSettings(input: StoreSettings) {
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: input, isPublic: true },
    update: { value: input },
  });
  invalidate(TAGS.settings);
  return input;
}

/** Contact details the storefront shows (header, footer, contact page). */
export async function getPublicStoreInfo() {
  const s = await getStoreSettings();
  return {
    phone: s.phone,
    email: s.email,
    addressBn: s.addressBn,
    addressEn: s.addressEn,
    facebookUrl: s.facebookUrl,
    instagramUrl: s.instagramUrl,
    whatsapp: s.whatsapp,
  };
}

export async function sendTestEmail(to: string) {
  const configured = Boolean(process.env.SMTP_HOST);
  await sendMail({
    to,
    subject: "Totofia test email",
    text: "SMTP works — this is a test email from the Totofia admin panel.",
    html: "<p>SMTP works — this is a test email from the Totofia admin panel.</p>",
  });
  return { smtpConfigured: configured };
}

/** Analytics ids for the storefront scripts (public by nature; empty = disabled). */
export async function getAnalyticsConfig() {
  const s = await getStoreSettings();
  return { ga4Id: s.ga4Id || null, fbPixelId: s.fbPixelId || null };
}
