import "server-only";
import { HELPLINE } from "@/components/storefront/constants";
import type { Locale } from "@/i18n/routing";
import { getPublicStoreInfo } from "@/server/modules/setting/setting.service";

export type ContactInfo = {
  /** As written in Settings (digits are localized when rendered). */
  phoneDisplay: string;
  /** `tel:` value, digits and a leading + only. */
  phoneTel: string;
  email: string | null;
  address: string | null;
  whatsappUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

/** Store contact details from Admin → Settings, falling back to the design's helpline. */
export async function getContactInfo(locale: Locale): Promise<ContactInfo> {
  const s = await getPublicStoreInfo().catch(() => null);
  const phone = s?.phone?.trim() || HELPLINE.display;
  const tel = phone.replace(/[^\d+]/g, "") || HELPLINE.tel;
  const address = (locale === "bn" ? s?.addressBn : s?.addressEn)?.trim();
  return {
    phoneDisplay: phone,
    phoneTel: tel,
    email: s?.email?.trim() || null,
    address: address || null,
    whatsappUrl: s?.whatsapp ? `https://wa.me/${s.whatsapp}` : null,
    facebookUrl: s?.facebookUrl || null,
    instagramUrl: s?.instagramUrl || null,
  };
}
