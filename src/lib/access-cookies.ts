// Cookie names shared by proxy.ts (no server-only imports there) and the pages that read them.

/** Guest order access token, moved out of `/order/N?token=` links by proxy.ts. */
export const orderTokenCookie = (orderNumber: number) => `tf_order_${orderNumber}`;

/** Password-reset token, moved out of `/reset-password?token=` by proxy.ts. */
export const RESET_TOKEN_COOKIE = "tf_reset";
