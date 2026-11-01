"use client";

import { useTranslations } from "next-intl";

type AuthError = { code?: string; status?: number } | null | undefined;

const CODE_TO_KEY: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "invalidCredentials",
  USER_ALREADY_EXISTS: "userExists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "userExists",
  PASSWORD_TOO_SHORT: "passwordTooShort",
  PASSWORD_TOO_LONG: "passwordTooLong",
  INVALID_PHONE: "invalidPhone",
  INVALID_EMAIL: "invalidEmail",
  ACCOUNT_BLOCKED: "blocked",
  INVALID_TOKEN: "invalidToken",
  INVALID_PASSWORD: "wrongPassword",
};

/** better-auth error → message in the page language (never the English server text). */
export function useAuthErrorMessage() {
  const t = useTranslations("Auth.errors");
  return (error: AuthError) => {
    if (error?.status === 429) return t("tooMany");
    const key = error?.code ? CODE_TO_KEY[error.code] : undefined;
    return t((key ?? "generic") as "generic");
  };
}
