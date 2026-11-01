import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { couponAdminInput } from "@/server/modules/coupon/coupon.schema";
import { deleteCoupon, getCoupon, updateCoupon } from "@/server/modules/coupon/coupon.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await getCoupon(params.id)),
);

export const PUT = apiHandler(
  { admin: true, params: idParams, body: couponAdminInput },
  async ({ params, body }) => ok(await updateCoupon(params.id, body)),
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await deleteCoupon(params.id)),
);
