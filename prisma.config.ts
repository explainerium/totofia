import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations need a direct (non-pooled) connection. Without DIRECT_URL, a Neon pooled URL is turned
// into its direct twin: the hosts differ only by "-pooler".
function directUrl(): string | undefined {
  if (process.env["DIRECT_URL"]) return process.env["DIRECT_URL"];
  const url = process.env["DATABASE_URL"];
  if (!url) return undefined;
  try {
    const u = new URL(url);
    u.hostname = u.hostname.replace(/-pooler(?=\.)/, "");
    return u.toString();
  } catch {
    return url;
  }
}

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    // react-server condition lets the seed import `server-only` service modules.
    seed: "tsx --conditions=react-server prisma/seed/index.ts",
  },
  datasource: {
    url: directUrl(),
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"] || undefined,
  },
});
