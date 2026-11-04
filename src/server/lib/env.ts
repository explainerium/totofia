import "server-only";
import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((v) => v || undefined);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  BETTER_AUTH_SECRET: optional,
  CRON_SECRET: optional,
  CREDENTIALS_KEY: optional,
  STORAGE_DRIVER: z.enum(["local", "r2", "cloudinary"]).default("local"),
  R2_ACCOUNT_ID: optional,
  R2_ACCESS_KEY_ID: optional,
  R2_SECRET_ACCESS_KEY: optional,
  R2_BUCKET: optional,
  NEXT_PUBLIC_MEDIA_URL: optional,
  CLOUDINARY_CLOUD_NAME: optional,
  CLOUDINARY_API_KEY: optional,
  CLOUDINARY_API_SECRET: optional,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Invalid environment variables — see .env.example");
}

export const env = parsed.data;

// A running production server refuses to start half-configured (skipped during `next build`,
// which runs with NODE_ENV=production but without runtime secrets).
if (env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
  const problems: string[] = [];
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    problems.push("BETTER_AUTH_SECRET (32+ random characters)");
  }
  if (!env.NEXT_PUBLIC_SITE_URL.startsWith("https://"))
    problems.push("NEXT_PUBLIC_SITE_URL (https)");
  if (!env.CRON_SECRET) problems.push("CRON_SECRET");
  if (!env.CREDENTIALS_KEY || env.CREDENTIALS_KEY.length < 32) {
    problems.push("CREDENTIALS_KEY (32+ characters, encrypts payment gateway credentials)");
  }
  // Vercel functions have no persistent disk; a VPS keeps ./uploads, so local is fine there.
  if (env.STORAGE_DRIVER === "local" && process.env.VERCEL)
    problems.push("STORAGE_DRIVER=cloudinary or r2 (Vercel has no persistent disk)");
  if (
    env.STORAGE_DRIVER === "cloudinary" &&
    !(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)
  ) {
    problems.push("CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET");
  }
  if (
    env.STORAGE_DRIVER === "r2" &&
    !(
      env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET &&
      env.NEXT_PUBLIC_MEDIA_URL
    )
  ) {
    problems.push(
      "R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / NEXT_PUBLIC_MEDIA_URL",
    );
  }
  if (problems.length) {
    throw new Error(`Missing production configuration: ${problems.join(", ")}`);
  }
}
