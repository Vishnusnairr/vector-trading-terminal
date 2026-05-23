/**
 * Strategy repository
 *
 * Strategies persist their block-config as JSON-in-a-string column. This
 * repo handles the (de)serialization so callers always get typed
 * StrategyConfig objects and never touch raw JSON.
 */

import { prisma } from '@/lib/prisma';
import { strategyConfig, backtestMetrics } from '@/lib/json';
import type { StrategyConfig, BacktestMetrics } from '@/types';
import type { StrategyStatus } from '@/lib/enums';

/**
 * Mirror of the Prisma `Strategy` model row.
 * Defined locally rather than imported from @prisma/client so this file
 * compiles even before `prisma generate` runs in a fresh checkout.
 */
interface StrategyRow {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: string;
  configJson: string;
  metricsJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Hydrated shape — config and metrics parsed from JSON columns */
export interface HydratedStrategy
  extends Omit<StrategyRow, 'configJson' | 'metricsJson'> {
  config: StrategyConfig;
  metrics: BacktestMetrics | null;
}

function hydrate(s: StrategyRow): HydratedStrategy {
  const { configJson, metricsJson, ...rest } = s;
  return {
    ...rest,
    config: strategyConfig.parse(configJson) ?? emptyConfig(),
    metrics: backtestMetrics.parse(metricsJson),
  };
}

function emptyConfig(): StrategyConfig {
  return {
    entryConditions: [],
    exitConditions: [],
    riskPerTrade: 0.01,
    stopLossPct: 0.02,
    takeProfitPct: 0.04,
    symbols: [],
    timeframe: '1h',
  };
}

export const strategyRepo = {
  async list(userId: string): Promise<HydratedStrategy[]> {
    const rows = await prisma.strategy.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(hydrate);
  },

  async findById(id: string): Promise<HydratedStrategy | null> {
    const row = await prisma.strategy.findUnique({ where: { id } });
    return row ? hydrate(row) : null;
  },

  async create(input: {
    userId: string;
    name: string;
    description?: string;
    status?: StrategyStatus;
    config: StrategyConfig;
  }) {
    const row = await prisma.strategy.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description,
        status: input.status ?? 'draft',
        configJson: strategyConfig.serialize(input.config),
      },
    });
    return hydrate(row);
  },

  async update(
    id: string,
    input: Partial<{
      name: string;
      description: string;
      status: StrategyStatus;
      config: StrategyConfig;
      metrics: BacktestMetrics;
    }>,
  ) {
    const row = await prisma.strategy.update({
      where: { id },
      data: {
        ...(input.name != null && { name: input.name }),
        ...(input.description != null && { description: input.description }),
        ...(input.status != null && { status: input.status }),
        ...(input.config != null && {
          configJson: strategyConfig.serialize(input.config),
        }),
        ...(input.metrics != null && {
          metricsJson: backtestMetrics.serialize(input.metrics),
        }),
      },
    });
    return hydrate(row);
  },

  async delete(id: string) {
    return prisma.strategy.delete({ where: { id } });
  },
};
