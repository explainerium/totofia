import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { listQuery } from "@/server/modules/catalog/shared.schema";
import { listReviews } from "@/server/modules/review/review.service";

const query = listQuery.extend({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional() });

export const GET = apiHandler({ admin: true, query }, async ({ query }) => {
  const { items, meta, pending } = await listReviews(query);
  return ok({ items, pending }, { meta });
});
