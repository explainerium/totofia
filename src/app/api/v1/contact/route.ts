import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { contactInput } from "@/server/modules/content/content.schema";
import { createContactMessage } from "@/server/modules/content/inbox.service";

export const POST = apiHandler(
  { body: contactInput, rateLimit: { name: "contact", limit: 5, windowMs: 10 * 60_000 } },
  async ({ body, locale }) => {
    await createContactMessage(locale, body);
    return ok(null, { status: 201 });
  },
);
