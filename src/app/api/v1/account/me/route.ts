import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { listAddresses } from "@/server/modules/account/account.service";

/** Signed-in customer + saved addresses (checkout prefill). `null` for guests. */
export const GET = apiHandler({}, async ({ user }) =>
  ok(user ? { user, addresses: await listAddresses(user.id) } : null),
);
