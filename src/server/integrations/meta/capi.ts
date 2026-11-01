import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "../../db/prisma";
import { logger } from "../../lib/logger";
import { siteUrl } from "@/lib/site-url";
import { getStoreSettings } from "../../modules/setting/setting.service";

const sha256 = (value: string) =>
  createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/** Browser Pixel and server event share this id so Meta counts the purchase once. */
export const purchaseEventId = (orderNumber: number) => `order-${orderNumber}`;

/**
 * Meta Conversions API "Purchase" (server side — survives ad blockers and iOS tracking limits).
 * Sent when a COD order is placed or an online order is paid. No-op unless both the Pixel id
 * (Admin → Settings) and META_CAPI_ACCESS_TOKEN are set. Never throws.
 */
export async function sendPurchaseEvent(orderId: string) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return;
  try {
    const { fbPixelId } = await getStoreSettings();
    if (!fbPixelId) return;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { productId: true, quantity: true } } },
    });
    if (!order) return;

    // Meta expects phone numbers with country code, digits only.
    const phone = `88${order.customerPhone}`;
    const version = process.env.META_GRAPH_VERSION ?? "v23.0";
    const res = await fetch(`https://graph.facebook.com/${version}/${fbPixelId}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        access_token: token,
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(order.createdAt.getTime() / 1000),
            event_id: purchaseEventId(order.number),
            action_source: "website",
            event_source_url: siteUrl(`/order/${order.number}`),
            user_data: {
              ph: [sha256(phone)],
              ...(order.customerEmail ? { em: [sha256(order.customerEmail)] } : {}),
              ...(order.userId ? { external_id: [sha256(order.userId)] } : {}),
              country: [sha256("bd")],
            },
            custom_data: {
              currency: "BDT",
              value: Number(order.grandTotal),
              content_type: "product",
              content_ids: order.items.flatMap((i) => (i.productId ? [i.productId] : [])),
              num_items: order.items.reduce((n, i) => n + i.quantity, 0),
              order_id: String(order.number),
            },
          },
        ],
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok)
      logger.warn({ status: res.status, body: await res.text() }, "Meta CAPI rejected event");
  } catch (err) {
    logger.warn({ err, orderId }, "Meta CAPI event failed");
  }
}
