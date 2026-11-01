"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/server/auth/auth";

// Same-origin: better-auth routes live at /api/auth/*.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export type AuthErrorCode = string | undefined;
