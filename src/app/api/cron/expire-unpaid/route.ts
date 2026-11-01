import { logger } from "@/server/lib/logger";
import { purgeExpiredCarts } from "@/server/modules/cart/cart.service";
import { expireUnpaidOnlineOrders } from "@/server/modules/payment/payment.service";

export const dynamic = "force-dynamic";

// Vercel Cron (vercel.json) calls this with "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }
  const orders = await expireUnpaidOnlineOrders();
  const carts = await purgeExpiredCarts();
  logger.info({ orders, carts }, "Cron: expire unpaid orders / carts");
  return Response.json({ orders, carts });
}
