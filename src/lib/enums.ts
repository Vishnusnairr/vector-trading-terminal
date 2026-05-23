/**
 * Runtime validators for string-enum columns in the DB.
 *
 * SQLite has no enum type, so the schema stores statuses as plain strings.
 * These const tuples + guards keep us honest: every value written to those
 * columns has to come from one of these lists.
 */

export const ORDER_SIDES = ['buy', 'sell'] as const;
export type OrderSide = (typeof ORDER_SIDES)[number];
export const isOrderSide = (v: unknown): v is OrderSide =>
  typeof v === 'string' && (ORDER_SIDES as readonly string[]).includes(v);

export const ORDER_TYPES = ['market', 'limit', 'stop', 'stop_limit'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];
export const isOrderType = (v: unknown): v is OrderType =>
  typeof v === 'string' && (ORDER_TYPES as readonly string[]).includes(v);

export const ORDER_STATUSES = [
  'pending',
  'filled',
  'partial',
  'cancelled',
  'rejected',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const isOrderStatus = (v: unknown): v is OrderStatus =>
  typeof v === 'string' && (ORDER_STATUSES as readonly string[]).includes(v);

export const STRATEGY_STATUSES = ['draft', 'paper', 'live', 'paused'] as const;
export type StrategyStatus = (typeof STRATEGY_STATUSES)[number];
export const isStrategyStatus = (v: unknown): v is StrategyStatus =>
  typeof v === 'string' &&
  (STRATEGY_STATUSES as readonly string[]).includes(v);

export const ASSET_CLASSES = [
  'crypto',
  'equity',
  'etf',
  'forex',
  'commodity',
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];
export const isAssetClass = (v: unknown): v is AssetClass =>
  typeof v === 'string' && (ASSET_CLASSES as readonly string[]).includes(v);

export const NOTIFICATION_TYPES = [
  'trade_filled',
  'stop_loss_hit',
  'take_profit_hit',
  'risk_alert',
  'strategy_signal',
  'system',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const BACKTEST_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
] as const;
export type BacktestStatus = (typeof BACKTEST_STATUSES)[number];

export const POSITION_CLOSE_REASONS = [
  'manual',
  'stop_loss',
  'take_profit',
  'liquidation',
] as const;
export type PositionCloseReason = (typeof POSITION_CLOSE_REASONS)[number];
