"use client";

// GA4 (gtag) + Meta Pixel events. Every call is a no-op when the scripts are not loaded
// (ids not set in Admin → Settings, ad blockers, SSR).

type Gtag = (command: "event", name: string, params: Record<string, unknown>) => void;
type Fbq = (
  command: "track",
  name: string,
  params: Record<string, unknown>,
  options?: { eventID: string },
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
  }
}

export type TrackItem = { id: string; name: string; price: number; quantity: number };

const CURRENCY = "BDT";

const gaItems = (items: TrackItem[]) =>
  items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }));
const total = (items: TrackItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

function send(
  ga: [string, Record<string, unknown>],
  fb: [string, Record<string, unknown>],
  eventID?: string,
) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", ga[0], ga[1]);
    window.fbq?.("track", fb[0], fb[1], eventID ? { eventID } : undefined);
  } catch {
    // Analytics must never break the shop.
  }
}

export function trackViewItem(item: Omit<TrackItem, "quantity">) {
  send(
    [
      "view_item",
      { currency: CURRENCY, value: item.price, items: gaItems([{ ...item, quantity: 1 }]) },
    ],
    [
      "ViewContent",
      {
        currency: CURRENCY,
        value: item.price,
        content_ids: [item.id],
        content_type: "product",
        content_name: item.name,
      },
    ],
  );
}

export function trackAddToCart(item: TrackItem) {
  const value = item.price * item.quantity;
  send(
    ["add_to_cart", { currency: CURRENCY, value, items: gaItems([item]) }],
    [
      "AddToCart",
      {
        currency: CURRENCY,
        value,
        content_ids: [item.id],
        content_type: "product",
        num_items: item.quantity,
      },
    ],
  );
}

export function trackBeginCheckout(items: TrackItem[]) {
  const value = total(items);
  send(
    ["begin_checkout", { currency: CURRENCY, value, items: gaItems(items) }],
    [
      "InitiateCheckout",
      {
        currency: CURRENCY,
        value,
        content_ids: items.map((i) => i.id),
        content_type: "product",
        num_items: items.reduce((n, i) => n + i.quantity, 0),
      },
    ],
  );
}

/**
 * Purchase, fired once per order per browser session. Pixel eventID matches the server-side
 * Conversions API event (`order-<number>`) so Meta de-duplicates the two.
 */
export function trackPurchase(order: {
  number: number;
  value: number;
  shipping: number;
  items: TrackItem[];
}) {
  if (typeof window === "undefined") return;
  const key = `tf_purchase_tracked_${order.number}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage blocked — still send once for this render.
  }
  send(
    [
      "purchase",
      {
        transaction_id: String(order.number),
        currency: CURRENCY,
        value: order.value,
        shipping: order.shipping,
        items: gaItems(order.items),
      },
    ],
    [
      "Purchase",
      {
        currency: CURRENCY,
        value: order.value,
        content_ids: order.items.map((i) => i.id),
        content_type: "product",
        num_items: order.items.reduce((n, i) => n + i.quantity, 0),
      },
    ],
    `order-${order.number}`,
  );
}
