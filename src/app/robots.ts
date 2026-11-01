import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Private and per-customer pages stay out of search results (they also send noindex).
const PRIVATE = [
  "/admin",
  "/api/",
  "/account",
  "/cart",
  "/checkout",
  "/order/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/search",
];

export default function robots(): MetadataRoute.Robots {
  const production = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";

  return {
    // Preview/staging deployments must never be indexed.
    rules: production
      ? { userAgent: "*", allow: "/", disallow: [...PRIVATE, ...PRIVATE.map((p) => `/en${p}`)] }
      : { userAgent: "*", disallow: "/" },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
