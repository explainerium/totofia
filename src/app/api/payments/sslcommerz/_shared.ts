import "server-only";
import { NextResponse } from "next/server";
import type { Locale } from "@/generated/prisma/client";
import { siteUrl } from "@/lib/site-url";

/** Form fields SSLCommerz posts to our callback URLs. */
export async function readGatewayForm(req: Request) {
  const form = await req.formData().catch(() => null);
  const get = (key: string) => {
    const value = form?.get(key);
    return typeof value === "string" && value.length <= 200 ? value : undefined;
  };
  return { tranId: get("tran_id"), valId: get("val_id"), error: get("error") };
}

/** 303 back to the customer's order page (in the order language). */
export function redirectToOrder(
  target: { number: number; token: string; locale: Locale } | null,
  params: Record<string, string>,
) {
  if (!target) return NextResponse.redirect(siteUrl("/"), 303);
  const prefix = target.locale === "bn" ? "" : `/${target.locale}`;
  const query = new URLSearchParams({ token: target.token, ...params });
  return NextResponse.redirect(siteUrl(`${prefix}/order/${target.number}?${query}`), 303);
}
