import "server-only";
import { ApiError } from "../http/api-error";
import { getSessionUser, isStaff, type SessionUser } from "./session";

/** Staff (ADMIN / STAFF) only. Throws 401 when signed out, 403 for customers. */
export async function assertAdminAccess(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "unauthorized");
  if (!isStaff(user)) throw new ApiError(403, "forbidden");
  return user;
}

export async function assertSignedIn(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "unauthorized");
  return user;
}
