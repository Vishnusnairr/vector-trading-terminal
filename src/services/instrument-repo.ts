/**
 * Instrument repository
 *
 * Reference data for the tradeable universe. Most callers want a tiny
 * subset (one symbol, or the user's watchlist), so we keep the shape
 * narrow and let the UI denormalize as needed.
 */

import { prisma } from '@/lib/prisma';
import type { AssetClass } from '@/lib/enums';

export const instrumentRepo = {
  async findAll() {
    return prisma.instrument.findMany({
      where: { active: true },
      orderBy: { symbol: 'asc' },
    });
  },

  async findOne(symbol: string) {
    return prisma.instrument.findUnique({ where: { symbol } });
  },

  async findByClass(assetClass: AssetClass) {
    return prisma.instrument.findMany({
      where: { active: true, assetClass },
      orderBy: { symbol: 'asc' },
    });
  },

  /**
   * Returns only instruments allowed under Ultra Safe Mode
   * (i.e. risky === false).
   */
  async findSafeOnly() {
    return prisma.instrument.findMany({
      where: { active: true, risky: false },
      orderBy: { symbol: 'asc' },
    });
  },

  /**
   * Quick Ultra Safe gating check used by the order engine.
   * Returns true if the symbol is blocked under USM.
   */
  async isBlockedByUltraSafe(symbol: string): Promise<boolean> {
    const inst = await prisma.instrument.findUnique({
      where: { symbol },
      select: { risky: true, active: true },
    });
    return !inst || !inst.active || inst.risky;
  },
};
