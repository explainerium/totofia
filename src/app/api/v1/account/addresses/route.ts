import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { addressInput } from "@/server/modules/account/account.schema";
import { createAddress, listAddresses } from "@/server/modules/account/account.service";

export const GET = apiHandler({ auth: true }, async ({ user }) =>
  ok(await listAddresses(user!.id)),
);

export const POST = apiHandler({ auth: true, body: addressInput }, async ({ user, body }) =>
  ok(await createAddress(user!.id, body), { status: 201 }),
);
