import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { getDashboard } from "@/server/modules/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

export const GET = apiHandler({ admin: true }, async () => ok(await getDashboard()));
