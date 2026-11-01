import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { couponAdminInput } from "@/server/modules/coupon/coupon.schema";
import { createCoupon, listCoupons } from "@/server/modules/coupon/coupon.service";

export const GET = apiHandler({ admin: true }, async () => ok(await listCoupons()));

export const POST = apiHandler({ admin: true, body: couponAdminInput }, async ({ body }) =>
  ok(await createCoupon(body), { status: 201 }),
);
