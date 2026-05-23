'use server';

import { prisma } from '@/lib/prisma';
import { userRepo } from '@/services/user-repo';
import { strategyRepo } from '@/services/strategy-repo';
import { strategyConfig, backtestMetrics } from '@/lib/json';
import type { StrategyConfig, BacktestMetrics, StrategyStatus } from '@/types';
import { DEFAULT_RISK_SETTINGS, ULTRA_SAFE_OVERRIDES } from '@/types';

/** Logs an event in the AuditLog database table */
export async function createAuditLog(userId: string | null, action: string, detail: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        detailJson: JSON.stringify(detail),
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

/** Synchronizes Ultra Safe Mode status to DB and updates user RiskSettings */
export async function syncUltraSafeMode(userId: string, enable: boolean) {
  try {
    const overrides = enable 
      ? { ...DEFAULT_RISK_SETTINGS, ...ULTRA_SAFE_OVERRIDES, ultraSafeMode: true }
      : { ...DEFAULT_RISK_SETTINGS, ultraSafeMode: false };

    const updated = await prisma.riskSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...overrides,
      },
      update: overrides,
    });

    await createAuditLog(userId, 'risk.usm_toggle', { ultraSafeMode: enable });

    return { success: true, settings: updated };
  } catch (error) {
    console.error('Failed to sync Ultra Safe Mode:', error);
    return { success: false, error: 'Database synchronization failed' };
  }
}

/** Server-side action to reset paper account balances and clear histories */
export async function resetPaperAccountAction(userId: string) {
  try {
    await userRepo.resetPaperAccount(userId);
    await createAuditLog(userId, 'account.reset', { balance: 100000 });
    return { success: true };
  } catch (error) {
    console.error('Failed to reset account:', error);
    return { success: false, error: 'Database reset transaction failed' };
  }
}

/** Server Action to save or update custom strategy block rules */
export async function saveStrategyAction(input: {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  status?: StrategyStatus;
  config: StrategyConfig;
}) {
  try {
    let strategy;
    if (input.id) {
      strategy = await strategyRepo.update(input.id, {
        name: input.name,
        description: input.description,
        status: input.status,
        config: input.config,
      });
      await createAuditLog(input.userId, 'strategy.update', { strategyId: input.id });
    } else {
      strategy = await strategyRepo.create({
        userId: input.userId,
        name: input.name,
        description: input.description,
        status: input.status || 'draft',
        config: input.config,
      });
      await createAuditLog(input.userId, 'strategy.create', { strategyId: strategy.id });
    }
    return { success: true, strategy };
  } catch (error) {
    console.error('Failed to save strategy:', error);
    return { success: false, error: 'Database save failed' };
  }
}

/** Triggers and records a backtest simulation run */
export async function recordBacktestRun(input: {
  userId: string;
  strategyId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  metrics: BacktestMetrics;
  equityCurve: any[];
  tradeLog: any[];
}) {
  try {
    const run = await prisma.backtest.create({
      data: {
        userId: input.userId,
        strategyId: input.strategyId,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        initialCapital: input.initialCapital,
        totalReturn: input.metrics.totalReturn,
        totalReturnPct: input.metrics.totalReturnPct,
        sharpe: input.metrics.sharpe,
        maxDrawdown: input.metrics.maxDrawdown,
        maxDrawdownPct: input.metrics.maxDrawdownPct,
        winRate: input.metrics.winRate,
        totalTrades: input.metrics.trades,
        avgWin: input.metrics.avgWin,
        avgLoss: input.metrics.avgLoss,
        status: 'completed',
        equityCurveJson: JSON.stringify(input.equityCurve),
        tradeLogJson: JSON.stringify(input.tradeLog),
      },
    });

    // Update strategy performance cache metrics
    await strategyRepo.update(input.strategyId, {
      metrics: input.metrics,
    });

    await createAuditLog(input.userId, 'backtest.run', { backtestId: run.id, strategyId: input.strategyId });

    return { success: true, backtestId: run.id };
  } catch (error) {
    console.error('Failed to record backtest run:', error);
    return { success: false, error: 'Database transaction failed' };
  }
}
