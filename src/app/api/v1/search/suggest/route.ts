import { z } from "zod";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { searchSuggestions } from "@/server/modules/catalog/catalog.service";

const query = z.object({ q: z.string().trim().min(2).max(60) });

export const GET = apiHandler({ query }, async ({ query, locale }) =>
  ok(await searchSuggestions(locale, query.q)),
);
