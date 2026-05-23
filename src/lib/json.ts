/**
 * JSON serialization helpers for Prisma fields stored as String.
 *
 * SQLite has no native JSON type, so config-shaped fields are serialized to
 * String and parsed at the boundary. These helpers keep the call sites tidy
 * and ensure we never store invalid JSON or `undefined`.
 */

import type {
  StrategyConfig,
  BacktestMetrics,
  NotificationType,
} from '@/types';

// ---- Generic ---------------------------------------------------------------

/** Stringify a value safely, returning null for null/undefined inputs. */
export function toJson<T>(value: T | null | undefined): string | null {
  if (value == null) return null;
  return JSON.stringify(value);
}

/** Parse a JSON string from the DB, returning null on failure/missing. */
export function fromJson<T>(raw: string | null | undefined): T | null {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ---- Typed convenience wrappers -------------------------------------------

export const strategyConfig = {
  serialize: (cfg: StrategyConfig): string => JSON.stringify(cfg),
  parse: (raw: string): StrategyConfig | null => fromJson<StrategyConfig>(raw),
};

export const backtestMetrics = {
  serialize: (m: BacktestMetrics): string => JSON.stringify(m),
  parse: (raw: string | null): BacktestMetrics | null =>
    fromJson<BacktestMetrics>(raw),
};

export interface NotificationMeta {
  orderId?: string;
  positionId?: string;
  strategyId?: string;
  symbol?: string;
  pnl?: number;
  [k: string]: unknown;
}

export const notificationMeta = {
  serialize: (m: NotificationMeta): string => JSON.stringify(m),
  parse: (raw: string | null): NotificationMeta | null =>
    fromJson<NotificationMeta>(raw),
};

export interface AuditDetail {
  [k: string]: unknown;
}

export const auditDetail = {
  serialize: (d: AuditDetail): string => JSON.stringify(d),
  parse: (raw: string | null): AuditDetail | null =>
    fromJson<AuditDetail>(raw),
};

// Re-export the notification type for ergonomics at call sites
export type { NotificationType };
