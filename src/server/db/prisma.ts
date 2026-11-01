import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "../lib/env";

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      // Drop idle connections before the server (Neon, Supabase pooler, `prisma dev`) closes them,
      // otherwise the pool hands out dead connections ("ConnectionClosed").
      idleTimeoutMillis: 10_000,
      // `npx prisma dev` (PGlite) handles one connection at a time → DATABASE_POOL_MAX=1 locally.
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
    }),
  });

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
