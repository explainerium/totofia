"use client";

import { toast } from "sonner";
import { isApiError } from "@/lib/api/axios";

/** API errors already arrive in the page language; fall back to a localized generic message. */
export function toastApiError(error: unknown, fallback: string) {
  toast.error(isApiError(error) && error.message && error.statusCode ? error.message : fallback);
}
