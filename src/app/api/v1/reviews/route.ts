import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { reviewInput } from "@/server/modules/content/content.schema";
import { createReview, reviewableProducts } from "@/server/modules/review/review.service";

/** Products the signed-in customer can still review. */
export const GET = apiHandler({ auth: true }, async ({ user, locale }) =>
  ok(await reviewableProducts(user!.id, locale)),
);

export const POST = apiHandler(
  {
    auth: true,
    body: reviewInput,
    rateLimit: { name: "review", limit: 10, windowMs: 10 * 60_000 },
  },
  async ({ user, body, locale }) => {
    await createReview(user!.id, locale, body);
    return ok(null, { status: 201 });
  },
);
