import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    // react-server condition lets the seed import `server-only` service modules.
    seed: "tsx --conditions=react-server prisma/seed/index.ts",
  },
  datasource: {
    // Migrations use the direct (non-pooled) connection when available.
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"] || undefined,
  },
});
