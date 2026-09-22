import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum di-set.");
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const adapter = new PrismaPg({
    connectionString: url,
    max: 5,
    // Supabase membutuhkan SSL
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
