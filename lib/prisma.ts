import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("postgres")) return envUrl;

  // On Vercel serverless, /var/task is read-only; copy bundled SQLite DB to /tmp
  if (process.env.VERCEL === "1") {
    const tmpDb = "/tmp/dev.db";
    if (!fs.existsSync(tmpDb)) {
      const bundledDb = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(bundledDb)) {
        fs.copyFileSync(bundledDb, tmpDb);
      }
    }
    return `file:${tmpDb}`;
  }

  return envUrl;
}

const resolvedUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
