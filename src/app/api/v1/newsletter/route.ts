import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { newsletterInput } from "@/server/modules/content/content.schema";
import { subscribeNewsletter } from "@/server/modules/content/inbox.service";

export const POST = apiHandler(
  { body: newsletterInput, rateLimit: { name: "newsletter", limit: 5, windowMs: 10 * 60_000 } },
  async ({ body, locale }) => {
    await subscribeNewsletter(body.email, locale);
    return ok(null, { status: 201 });
  },
);
