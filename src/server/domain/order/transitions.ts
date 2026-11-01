export type OrderStatus =
  "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

/** Allowed next statuses. CANCELLED and RETURNED are final. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUSES[from].includes(to);
}

/** Items go back into stock when an order is cancelled or returned. */
export function restocksOn(to: OrderStatus): boolean {
  return to === "CANCELLED" || to === "RETURNED";
}

/** A cancelled order frees its coupon use again (a returned one does not). */
export function releasesCouponOn(to: OrderStatus): boolean {
  return to === "CANCELLED";
}

/** Cash on delivery is collected when the parcel is delivered. */
export function marksCodPaidOn(to: OrderStatus): boolean {
  return to === "DELIVERED";
}

/** Status changes the customer is told about by email. */
export function notifiesCustomerOn(to: OrderStatus): boolean {
  return to === "CONFIRMED" || to === "SHIPPED" || to === "DELIVERED" || to === "CANCELLED";
}
