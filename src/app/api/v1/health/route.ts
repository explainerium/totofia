import { prisma } from "@/server/db/prisma";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";

export const dynamic = "force-dynamic";

export const GET = apiHandler({}, async () => {
  await prisma.$queryRaw`SELECT 1`;
  return ok({ status: "ok", time: new Date().toISOString() });
});
