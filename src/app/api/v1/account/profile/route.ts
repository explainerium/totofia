import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { profileInput } from "@/server/modules/account/account.schema";
import { updateProfile } from "@/server/modules/account/account.service";

export const PATCH = apiHandler({ auth: true, body: profileInput }, async ({ user, body }) =>
  ok(await updateProfile(user!.id, body)),
);
