const BASE = "http://site.invalid";

/**
 * `?next=` after sign-in: only same-site relative paths ("/account/orders"), never
 * "//evil.com", "https://…", backslash or control-character tricks. Locale prefixes are stripped
 * because the locale-aware router adds the current one.
 */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  // URL parsers drop tabs/newlines and trim spaces, so "/\t/evil.com" would become "//evil.com".
  // Rejected: control characters and space (0x00–0x20), DEL (0x7f) and backslashes.
  if (!next || !next.startsWith("/") || /[\x00-\x20\x7f\\]/.test(next)) return fallback;
  const path = next.replace(/^\/(bn|en)(?=\/|$)/, "") || "/";
  if (path.startsWith("//")) return fallback;
  // Final check the way the browser will read it: it must stay on this site.
  try {
    return new URL(path, BASE).origin === BASE ? path : fallback;
  } catch {
    return fallback;
  }
}
