/**
 * Vector core domain types
 * Single source of truth shared between client, server, engine, and DB layer.
 *
 * String-enum types (OrderSide, OrderType, OrderStatus, StrategyStatus,
 * AssetClass, NotificationType) come from src/lib/enums.ts where they're
 * paired with runtime validators and used by the API layer.
 */

export type {
  OrderSide,
  OrderType,
  OrderStatus,
  StrategyStatus,
  AssetClass,
  NotificationType,
  BacktestStatus,
  PositionCloseReason,
} from '@/lib/enums';

import type {
  OrderSide,
  OrderType,
  OrderStatus,
  StrategyStatus,
  AssetClass,
  NotificationType,
} from '@/lib/enums';

// ============================================================================
// Instruments
// ============================================================================

export interface Instrument {
  /** Ticker symbol, e.g. 'BTCUSD', 'AAPL' */
  symbol: string;
  /** Human-readable name */
  name: string;
  /** Asset class for filtering and risk rules */
  assetClass: AssetClass;
  /** Marked risky for Ultra Safe Mode filtering */
  risky: boolean;
  /** Tick size for price increments */
  tickSize: number;
  /** Minimum order quantity */
  minQty: number;
}

// ============================================================================
// Market data
// ============================================================================

export interface Candle {
  /** Unix ms timestamp at candle open */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  /** Volume in base units */
  v: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface Ticker {
  symbol: string;
  price: number;
  /** Best bid */
  bid: number;
  /** Best ask */
  ask: number;
  /** 24-hour change in % */
  change24h: number;
  /** 24-hour volume */
  volume24h: number;
  ts: number;
}

// ============================================================================
// Trading — orders, positions, trades
// ============================================================================

// (OrderSide, OrderType, OrderStatus re-exported at the top from @/lib/enums)

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  /** Limit price (for limit/stop_limit) */
  price?: number;
  /** Stop price (for stop/stop_limit) */
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  /** Average fill price */
  filledPrice?: number;
  filledQty: number;
  fees: number;
  createdAt: Date;
  filledAt?: Date;
  /** Optional strategy that placed the order */
  strategyId?: string;
  /** Free-form notes for trade journaling */
  notes?: string;
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  /** Average entry price */
  entryPrice: number;
  /** Latest mark price */
  markPrice: number;
  /** Realized P&L (closed portion) */
  realizedPnl: number;
  /** Unrealized P&L (open portion) */
  unrealizedPnl: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: Date;
  /** If closed */
  closedAt?: Date;
  strategyId?: string;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  price: number;
  fees: number;
  pnl?: number;
  ts: Date;
}

// ============================================================================
// Strategies
// ============================================================================

// (StrategyStatus re-exported at the top from @/lib/enums)

export type ConditionType =
  | 'rsi_below'
  | 'rsi_above'
  | 'sma_cross_up'
  | 'sma_cross_down'
  | 'price_above_sma'
  | 'price_below_sma'
  | 'macd_bull_cross'
  | 'macd_bear_cross'
  | 'volume_spike'
  | 'breakout_high'
  | 'breakout_low';

export interface StrategyCondition {
  id: string;
  type: ConditionType;
  /** Free-form params: { period: 14, threshold: 30 } */
  params: Record<string, number>;
}

export interface StrategyConfig {
  entryConditions: StrategyCondition[];
  exitConditions: StrategyCondition[];
  /** Risk per trade as fraction of capital, e.g. 0.01 = 1% */
  riskPerTrade: number;
  /** Stop-loss as % distance from entry */
  stopLossPct: number;
  /** Take-profit as % distance from entry */
  takeProfitPct: number;
  /** Allowed instrument symbols */
  symbols: string[];
  /** Candle timeframe */
  timeframe: Timeframe;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: StrategyStatus;
  config: StrategyConfig;
  /** Performance metrics if backtested */
  metrics?: BacktestMetrics;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Backtest
// ============================================================================

export interface BacktestMetrics {
  totalReturn: number;
  totalReturnPct: number;
  sharpe: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  winRate: number;
  trades: number;
  avgWin: number;
  avgLoss: number;
  /** Equity curve points */
  equity: Array<{ t: number; value: number }>;
}

export interface BacktestRequest {
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commissionPct: number;
  slippagePct: number;
}

// ============================================================================
// Risk
// ============================================================================

export interface RiskSettings {
  /** Master kill-switch — when true, all trades go through Ultra Safe filters */
  ultraSafeMode: boolean;
  /** Max % of capital risked per trade */
  maxRiskPerTrade: number;
  /** Daily loss limit as % of capital */
  dailyLossLimit: number;
  /** Max consecutive losses before cooldown kicks in */
  maxConsecutiveLosses: number;
  /** Cooldown duration in minutes after triggering */
  cooldownMinutes: number;
  /** Auto-reduce position size when drawdown exceeds this % */
  drawdownReductionThreshold: number;
}

export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  ultraSafeMode: false,
  maxRiskPerTrade: 0.02,
  dailyLossLimit: 0.05,
  maxConsecutiveLosses: 3,
  cooldownMinutes: 60,
  drawdownReductionThreshold: 0.1,
};

export const ULTRA_SAFE_OVERRIDES: Partial<RiskSettings> = {
  maxRiskPerTrade: 0.01,
  dailyLossLimit: 0.02,
  maxConsecutiveLosses: 2,
  cooldownMinutes: 240,
  drawdownReductionThreshold: 0.05,
};

// ============================================================================
// Notifications
// ============================================================================

// (NotificationType re-exported at the top from @/lib/enums)

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}
