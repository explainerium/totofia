import { apiHandler } from "@/server/http/api-handler";
import { subscribersCsv } from "@/server/modules/content/inbox.service";

export const GET = apiHandler(
  { admin: true },
  async () =>
    new Response(await subscribersCsv(), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="totofia-newsletter.csv"',
      },
    }),
);
