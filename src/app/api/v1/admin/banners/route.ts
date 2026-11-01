import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { bannerInput } from "@/server/modules/content/content.schema";
import { createBanner, listBanners } from "@/server/modules/content/banner.service";

export const GET = apiHandler({ admin: true }, async () => ok(await listBanners()));

export const POST = apiHandler({ admin: true, body: bannerInput }, async ({ body }) =>
  ok(await createBanner(body), { status: 201 }),
);
