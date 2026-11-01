import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { listPayments, recheckOrderPayments } from "@/server/modules/payment/payment.service";

export const GET = apiHandler({ admin: true, params: idParams }, async ({ params }) =>
  ok(await listPayments(params.id)),
);

/** Ask the gateway about this order's attempts (stuck payment / missed IPN). */
export const POST = apiHandler(
  { admin: true, params: idParams, rateLimit: { name: "recheck", limit: 10, windowMs: 60_000 } },
  async ({ params }) => {
    const paid = await recheckOrderPayments(params.id);
    return ok({ paid, payments: await listPayments(params.id) });
  },
);
