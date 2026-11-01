"use client";

import { useEffect } from "react";
import { trackBeginCheckout, trackPurchase, trackViewItem, type TrackItem } from "./track";

type Props =
  | { event: "view_item"; item: Omit<TrackItem, "quantity"> }
  | { event: "begin_checkout"; items: TrackItem[] }
  | {
      event: "purchase";
      order: { number: number; value: number; shipping: number; items: TrackItem[] };
    };

/** Fires one analytics event after mount (server pages drop this in with their data). */
export function TrackEvent(props: Props) {
  const key = JSON.stringify(props);
  useEffect(() => {
    // Scripts load "afterInteractive"; give them a moment so the first event is not lost.
    const timer = window.setTimeout(() => {
      const p = JSON.parse(key) as Props;
      if (p.event === "view_item") trackViewItem(p.item);
      else if (p.event === "begin_checkout") trackBeginCheckout(p.items);
      else trackPurchase(p.order);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [key]);
  return null;
}
