import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { testEmailInput } from "@/server/modules/setting/setting.schema";
import { sendTestEmail } from "@/server/modules/setting/setting.service";

export const POST = apiHandler(
  {
    admin: true,
    body: testEmailInput,
    rateLimit: { name: "test-email", limit: 5, windowMs: 60_000 },
  },
  async ({ body }) => ok(await sendTestEmail(body.to)),
);
