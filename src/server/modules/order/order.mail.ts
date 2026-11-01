import "server-only";
import { createTranslator } from "use-intl/core";
import type { Locale } from "@/generated/prisma/client";
import { formatDigits, formatPrice } from "@/lib/format/intl";
import { findDistrict } from "@/lib/geo/bd";
import { siteUrl } from "@/lib/site-url";
import bn from "../../../../messages/bn.json";
import en from "../../../../messages/en.json";
import { prisma } from "../../db/prisma";
import { sendMail } from "../../integrations/mail/mailer";

const catalogs = { bn, en } as const;

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Link that opens the order without an account. */
export function guestOrderUrl(locale: Locale, number: number, token: string) {
  const prefix = locale === "bn" ? "" : `/${locale}`;
  return siteUrl(`${prefix}/order/${number}?token=${encodeURIComponent(token)}`);
}

export async function sendOrderPlacedEmails(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, address: true },
  });
  if (!order) return;

  const recipients: { to: string; locale: Locale; staff: boolean }[] = [];
  if (order.customerEmail)
    recipients.push({ to: order.customerEmail, locale: order.locale, staff: false });
  if (process.env.ADMIN_NOTIFY_EMAIL) {
    recipients.push({ to: process.env.ADMIN_NOTIFY_EMAIL, locale: "en", staff: true });
  }

  for (const r of recipients) {
    const t = createTranslator({
      locale: r.locale,
      messages: catalogs[r.locale],
      namespace: "Email",
    });
    const number = formatDigits(order.number, r.locale);
    const price = (v: { toString(): string }) => formatPrice(Number(v), r.locale);
    const district = order.address ? findDistrict(order.address.district)?.name[r.locale] : "";

    const rows = order.items
      .map((i) => {
        const name = r.locale === "bn" ? i.nameBn : i.nameEn;
        const label = r.locale === "bn" ? i.variantLabelBn : i.variantLabelEn;
        return `<tr><td style="padding:6px 0">${escape(name)}<br><small style="color:#3e4947">${escape(label)} × ${formatDigits(i.quantity, r.locale)}</small></td><td style="padding:6px 0;text-align:right">${price(i.lineTotal)}</td></tr>`;
      })
      .join("");
    const totalRow = (label: string, value: string, bold = false) =>
      `<tr><td style="padding:4px 0${bold ? ";font-weight:700" : ""}">${label}</td><td style="padding:4px 0;text-align:right${bold ? ";font-weight:700" : ""}">${value}</td></tr>`;

    const link = r.staff
      ? siteUrl(`/admin/dashboard/orders/${order.id}`)
      : guestOrderUrl(order.locale, order.number, order.guestAccessToken);

    const subject = r.staff
      ? t("staffSubject", { number, name: order.customerName })
      : t("placedSubject", { number });
    const intro = r.staff
      ? t("staffIntro")
      : t("placedIntro", { name: escape(order.customerName) });
    const payment =
      order.paymentMethod === "COD"
        ? t("paymentCod")
        : order.paymentStatus === "PAID"
          ? t("paymentOnlinePaid")
          : t("paymentOnlinePending");

    const html = `<!doctype html><html lang="${r.locale}"><body style="margin:0;background:#fff8f5;font-family:'Noto Sans','Noto Sans Bengali',Arial,sans-serif;color:#1f1b17">
<div style="max-width:560px;margin:0 auto;padding:24px">
<h1 style="color:#005c55;font-size:22px;margin:0 0 16px">${t("brand")}</h1>
<p>${intro}</p>
<p style="font-weight:700">${t("orderNumber", { number })}</p>
<table style="width:100%;border-collapse:collapse;border-top:1px solid #bdc9c6;border-bottom:1px solid #bdc9c6">${rows}</table>
<table style="width:100%;margin-top:8px">
${totalRow(t("subtotal"), price(order.subtotal))}
${Number(order.discount) > 0 ? totalRow(t("discount"), `−${price(order.discount)}`) : ""}
${totalRow(t("delivery"), Number(order.shippingFee) === 0 ? t("free") : price(order.shippingFee))}
${totalRow(t("total"), price(order.grandTotal), true)}
</table>
<p>${payment}</p>
${order.address ? `<p><strong>${t("deliverTo")}</strong><br>${escape(order.address.name)}, ${escape(order.address.phone)}<br>${escape(order.address.addressLine)}, ${escape(order.address.area)}, ${escape(district ?? "")}</p>` : ""}
<p><a href="${link}" style="display:inline-block;background:#005c55;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${r.staff ? t("openInAdmin") : t("viewOrder")}</a></p>
</div></body></html>`;

    const text = `${intro}\n${t("orderNumber", { number })}\n${t("total")}: ${price(order.grandTotal)}\n${link}`;
    await sendMail({ to: r.to, subject, html, text });
  }
}

type NotifiedStatus = "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

/** Customer email when staff confirm, ship, deliver or cancel an order (order language). */
export async function sendOrderStatusEmail(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.customerEmail) return;
  const status = order.status as NotifiedStatus;
  if (!["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) return;

  const locale = order.locale;
  const t = createTranslator({ locale, messages: catalogs[locale], namespace: "Email" });
  const number = formatDigits(order.number, locale);
  const intro = t(`status${status}`, { name: escape(order.customerName) });
  const tracking =
    status === "SHIPPED" && order.trackingCode
      ? `<p>${t("trackingLine", {
          courier: escape(order.courierName ?? ""),
          code: escape(order.trackingCode),
        })}</p>`
      : "";
  const link = guestOrderUrl(locale, order.number, order.guestAccessToken);

  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#fff8f5;font-family:'Noto Sans','Noto Sans Bengali',Arial,sans-serif;color:#1f1b17">
<div style="max-width:560px;margin:0 auto;padding:24px">
<h1 style="color:#005c55;font-size:22px;margin:0 0 16px">${t("brand")}</h1>
<p style="font-weight:700">${t("orderNumber", { number })}</p>
<p>${intro}</p>${tracking}
<p><a href="${link}" style="display:inline-block;background:#005c55;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${t("viewOrder")}</a></p>
</div></body></html>`;

  await sendMail({
    to: order.customerEmail,
    subject: t(`statusSubject${status}`, { number }),
    html,
    text: `${t("orderNumber", { number })}\n${intro}\n${link}`,
  });
}
