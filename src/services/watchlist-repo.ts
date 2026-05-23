/**
 * Watchlist repository
 *
 * The watchlist is a user-ordered list of instruments. Position numbers are
 * sparse on purpose so reordering doesn't have to renumber every row.
 */

import { prisma } from '@/lib/prisma';

export const watchlistRepo = {
  /** All items for a user, ordered for display */
  async list(userId: string) {
    return prisma.watchlistItem.findMany({
      where: { userId },
      include: { instrument: true },
      orderBy: { position: 'asc' },
    });
  },

  /** Add a symbol to the end of the list (idempotent) */
  async add(userId: string, symbol: string) {
    const max = await prisma.watchlistItem.aggregate({
      where: { userId },
      _max: { position: true },
    });
    const nextPos = (max._max.position ?? -1) + 1;

    return prisma.watchlistItem.upsert({
      where: { userId_symbol: { userId, symbol } },
      create: { userId, symbol, position: nextPos },
      update: {},
    });
  },

  /** Remove a single item */
  async remove(userId: string, symbol: string) {
    return prisma.watchlistItem.deleteMany({
      where: { userId, symbol },
    });
  },

  /** Reorder by replacing all positions in one transaction */
  async reorder(userId: string, symbols: string[]) {
    return prisma.$transaction(
      symbols.map((symbol, position) =>
        prisma.watchlistItem.updateMany({
          where: { userId, symbol },
          data: { position },
        }),
      ),
    );
  },
};
