import { apiHandler } from "@/server/http/api-handler";
import { ApiError } from "@/server/http/api-error";
import { ok } from "@/server/http/response";
import { uploadImage } from "@/server/modules/media/media.service";

// multipart/form-data with a single `file` field.
export const POST = apiHandler({ admin: true }, async ({ req }) => {
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "validation");
  return ok(await uploadImage(file), { status: 201 });
});
