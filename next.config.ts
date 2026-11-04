import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Uploaded media comes from Cloudinary or R2 (NEXT_PUBLIC_MEDIA_URL) on Vercel, from /media/...
// (same origin) in development and on a VPS.
const mediaBase =
  process.env.NEXT_PUBLIC_MEDIA_URL ||
  (process.env.STORAGE_DRIVER === "cloudinary" && process.env.CLOUDINARY_CLOUD_NAME
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    : "");
const mediaUrl = mediaBase ? new URL(mediaBase) : null;

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    remotePatterns: mediaUrl
      ? [
          {
            protocol: mediaUrl.protocol.replace(":", "") as "https" | "http",
            hostname: mediaUrl.hostname,
          },
        ]
      : [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Staff area never shows up in search engines, whatever links point to it.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default withNextIntl(nextConfig);
