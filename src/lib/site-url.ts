/** Absolute URL for a site path. Already absolute URLs (media on R2/CDN) pass through. */
export function siteUrl(path = ""): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
