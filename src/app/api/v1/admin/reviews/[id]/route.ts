import { apiHandler } from "@/server/http/api-handler";
import { idParams } from "@/server/http/params";
import { ok } from "@/server/http/response";
import { reviewStatusInput } from "@/server/modules/content/content.schema";
import { deleteReview, setReviewStatus } from "@/server/modules/review/review.service";

export const PATCH = apiHandler(
  { admin: true, params: idParams, body: reviewStatusInput },
  async ({ params, body }) => {
    await setReviewStatus(params.id, body.status);
    return ok(null);
  },
);

export const DELETE = apiHandler({ admin: true, params: idParams }, async ({ params }) => {
  await deleteReview(params.id);
  return ok(null);
});
