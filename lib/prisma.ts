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
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.resolve("prisma/dev.db"),
        path.join(__dirname, "../../prisma/dev.db"),
        path.join(__dirname, "../../../prisma/dev.db"),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, tmpDb);
          break;
        }
      }
    }
    return `file:${tmpDb}`;
  }

  return envUrl || "file:./prisma/dev.db";
}

const resolvedUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
