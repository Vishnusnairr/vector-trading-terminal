import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * Next.js dev hot-reload causes the module to re-execute on every change,
 * which without this pattern leaks a new PrismaClient per reload and
 * eventually exhausts the connection pool. We stash the instance on
 * globalThis in development so reloads reuse the same client.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
