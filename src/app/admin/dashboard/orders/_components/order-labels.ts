import type { AdminOrderListItem } from "@/server/modules/order/order.service";

type Status = AdminOrderListItem["status"];

export const ORDER_STATUSES: Status[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export const statusVariant: Record<Status, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "outline",
  CANCELLED: "destructive",
  RETURNED: "destructive",
};

export const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
