/**
 * Vector — Database seed
 *
 * Populates a fresh database with:
 *   • 16 instruments across crypto/equity/etf/forex/commodity
 *   • 1 demo user (credentials: demo@vector.io / demo123 — change in prod)
 *   • Default RiskSettings row for the demo user
 *   • A starter watchlist (8 symbols)
 *   • 3 sample strategies (Mean Reversion, EMA Cross, RSI Divergence)
 *   • A handful of notifications so the bell isn't empty on first load
 *   • App-level config rows (feature flags, version)
 *
 * Idempotent — run as many times as you like. Existing rows are upserted.
 *
 * Usage:  npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { strategyConfig } from '../src/lib/json';
import type { StrategyConfig } from '../src/types';

const prisma = new PrismaClient();

// ============================================================================
// 1. Instruments — the universe Vector trades
// ============================================================================

const INSTRUMENTS = [
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin',        assetClass: 'crypto',    risky: true,  refPrice: 67234.50, vol: 0.0018, tickSize: 0.01,   minQty: 0.0001 },
  { symbol: 'ETHUSD', name: 'Ethereum',       assetClass: 'crypto',    risky: true,  refPrice: 3245.80,  vol: 0.0022, tickSize: 0.01,   minQty: 0.001  },
  { symbol: 'SOLUSD', name: 'Solana',         assetClass: 'crypto',    risky: true,  refPrice: 142.30,   vol: 0.0035, tickSize: 0.01,   minQty: 0.01   },
  { symbol: 'AVAXUSD',name: 'Avalanche',      assetClass: 'crypto',    risky: true,  refPrice: 38.50,    vol: 0.0040, tickSize: 0.01,   minQty: 0.01   },

  // US Equities
  { symbol: 'AAPL',   name: 'Apple Inc.',     assetClass: 'equity',    risky: false, refPrice: 218.45,   vol: 0.0008, tickSize: 0.01,   minQty: 1      },
  { symbol: 'NVDA',   name: 'NVIDIA',         assetClass: 'equity',    risky: false, refPrice: 478.20,   vol: 0.0015, tickSize: 0.01,   minQty: 1      },
  { symbol: 'TSLA',   name: 'Tesla',          assetClass: 'equity',    risky: true,  refPrice: 245.67,   vol: 0.0025, tickSize: 0.01,   minQty: 1      },
  { symbol: 'MSFT',   name: 'Microsoft',      assetClass: 'equity',    risky: false, refPrice: 412.80,   vol: 0.0007, tickSize: 0.01,   minQty: 1      },
  { symbol: 'GOOGL',  name: 'Alphabet',       assetClass: 'equity',    risky: false, refPrice: 178.20,   vol: 0.0009, tickSize: 0.01,   minQty: 1      },
  { symbol: 'AMZN',   name: 'Amazon',         assetClass: 'equity',    risky: false, refPrice: 198.40,   vol: 0.0010, tickSize: 0.01,   minQty: 1      },

  // ETFs
  { symbol: 'SPY',    name: 'S&P 500 ETF',    assetClass: 'etf',       risky: false, refPrice: 542.18,   vol: 0.0005, tickSize: 0.01,   minQty: 1      },
  { symbol: 'QQQ',    name: 'Nasdaq 100 ETF', assetClass: 'etf',       risky: false, refPrice: 478.30,   vol: 0.0006, tickSize: 0.01,   minQty: 1      },

  // Commodities
  { symbol: 'GOLD',   name: 'Gold Spot',      assetClass: 'commodity', risky: false, refPrice: 2398.40,  vol: 0.0006, tickSize: 0.10,   minQty: 0.01   },
  { symbol: 'OIL',    name: 'WTI Crude Oil',  assetClass: 'commodity', risky: true,  refPrice: 78.45,    vol: 0.0020, tickSize: 0.01,   minQty: 0.1    },

  // Forex
  { symbol: 'EURUSD', name: 'Euro / US Dollar',     assetClass: 'forex', risky: false, refPrice: 1.0834, vol: 0.0003, tickSize: 0.0001, minQty: 100  },
  { symbol: 'GBPUSD', name: 'British Pound / USD',  assetClass: 'forex', risky: false, refPrice: 1.2645, vol: 0.0004, tickSize: 0.0001, minQty: 100  },

  // Indian Stock Equities (NSE India)
  { symbol: 'RELIANCE', name: 'Reliance Industries', assetClass: 'equity', risky: false, refPrice: 2450.00, vol: 0.0008, tickSize: 0.05, minQty: 1 },
  { symbol: 'TCS',      name: 'Tata Consultancy',    assetClass: 'equity', risky: false, refPrice: 3850.00, vol: 0.0007, tickSize: 0.05, minQty: 1 },
  { symbol: 'INFY',     name: 'Infosys Ltd.',        assetClass: 'equity', risky: false, refPrice: 1420.00, vol: 0.0009, tickSize: 0.05, minQty: 1 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.',      assetClass: 'equity', risky: false, refPrice: 1610.00, vol: 0.0008, tickSize: 0.05, minQty: 1 },
] as const;

// ============================================================================
// 2. Sample strategy configs
// ============================================================================

const STRATEGY_MEAN_REVERSION: StrategyConfig = {
  entryConditions: [
    { id: 'c1', type: 'rsi_below', params: { period: 14, threshold: 30 } },
    { id: 'c2', type: 'price_above_sma', params: { period: 50 } },
  ],
  exitConditions: [
    { id: 'x1', type: 'rsi_above', params: { period: 14, threshold: 60 } },
  ],
  riskPerTrade: 0.005,   // 0.5%
  stopLossPct: 0.02,     // 2%
  takeProfitPct: 0.04,   // 4%
  symbols: ['AAPL', 'MSFT', 'SPY', 'QQQ'],
  timeframe: '1h',
};

const STRATEGY_EMA_CROSS: StrategyConfig = {
  entryConditions: [
    { id: 'c1', type: 'sma_cross_up', params: { fast: 9, slow: 21 } },
  ],
  exitConditions: [
    { id: 'x1', type: 'sma_cross_down', params: { fast: 9, slow: 21 } },
  ],
  riskPerTrade: 0.01,
  stopLossPct: 0.015,
  takeProfitPct: 0.03,
  symbols: ['BTCUSD', 'ETHUSD'],
  timeframe: '15m',
};

const STRATEGY_RSI_DIVERGENCE: StrategyConfig = {
  entryConditions: [
    { id: 'c1', type: 'rsi_below', params: { period: 14, threshold: 35 } },
    { id: 'c2', type: 'volume_spike', params: { multiplier: 1.5 } },
  ],
  exitConditions: [
    { id: 'x1', type: 'rsi_above', params: { period: 14, threshold: 70 } },
  ],
  riskPerTrade: 0.008,
  stopLossPct: 0.025,
  takeProfitPct: 0.05,
  symbols: ['NVDA', 'TSLA', 'GOOGL'],
  timeframe: '4h',
};

// ============================================================================
// 3. Main seed routine
// ============================================================================

async function main() {
  console.log('🌱 Seeding Vector database…\n');

  // ---- Instruments ---------------------------------------------------------
  console.log(`  → Upserting ${INSTRUMENTS.length} instruments`);
  for (const inst of INSTRUMENTS) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      create: inst,
      update: inst,
    });
  }

  // ---- Demo user -----------------------------------------------------------
  console.log('  → Creating demo user');
  const passwordHash = await bcrypt.hash('demo123', 10);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@vector.io' },
    create: {
      email: 'demo@vector.io',
      name: 'Demo Trader',
      password: passwordHash,
      paperBalance: 100_000,
      emailVerified: new Date(),
    },
    update: {
      // re-hash password on each seed so it stays in sync
      password: passwordHash,
    },
  });

  // ---- Risk settings -------------------------------------------------------
  console.log('  → Risk settings (defaults — Ultra Safe Mode OFF)');
  await prisma.riskSettings.upsert({
    where: { userId: demo.id },
    create: { userId: demo.id },
    update: {},
  });

  // ---- Watchlist -----------------------------------------------------------
  console.log('  → Watchlist (8 symbols)');
  const watchSymbols = ['RELIANCE', 'TCS', 'BTCUSD', 'ETHUSD', 'AAPL', 'NVDA', 'SPY', 'GOLD'];
  for (let i = 0; i < watchSymbols.length; i++) {
    await prisma.watchlistItem.upsert({
      where: { userId_symbol: { userId: demo.id, symbol: watchSymbols[i] } },
      create: { userId: demo.id, symbol: watchSymbols[i], position: i },
      update: { position: i },
    });
  }

  // ---- Strategies ----------------------------------------------------------
  console.log('  → 3 sample strategies');

  // Delete + recreate strategies (simpler than reconciling by name)
  await prisma.strategy.deleteMany({ where: { userId: demo.id } });

  await prisma.strategy.createMany({
    data: [
      {
        userId: demo.id,
        name: 'Mean Reversion Long',
        description: 'Buy oversold pullbacks above the 50-period SMA',
        status: 'paper',
        configJson: strategyConfig.serialize(STRATEGY_MEAN_REVERSION),
      },
      {
        userId: demo.id,
        name: 'EMA 9/21 Crossover',
        description: 'Trend-following crypto crossover system',
        status: 'paper',
        configJson: strategyConfig.serialize(STRATEGY_EMA_CROSS),
      },
      {
        userId: demo.id,
        name: 'RSI + Volume Divergence',
        description: 'Reversal entries on oversold RSI + volume spike',
        status: 'draft',
        configJson: strategyConfig.serialize(STRATEGY_RSI_DIVERGENCE),
      },
    ],
  });

  // ---- Notifications -------------------------------------------------------
  console.log('  → Welcome notifications');
  await prisma.notification.deleteMany({ where: { userId: demo.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: demo.id,
        type: 'system',
        title: 'Welcome to Vector',
        body: 'Your paper account is funded with $100,000. Visit the Risk Center to configure Ultra Safe Mode.',
        read: false,
      },
      {
        userId: demo.id,
        type: 'system',
        title: 'Sample strategies loaded',
        body: 'Three example strategies are ready to backtest. Open the Strategies tab to try them.',
        read: false,
      },
      {
        userId: demo.id,
        type: 'risk_alert',
        title: 'Ultra Safe Mode available',
        body: 'New here? Enable Ultra Safe Mode to enforce 1% per-trade risk caps and filter out volatile assets.',
        read: true,
      },
    ],
  });

  // ---- App metadata --------------------------------------------------------
  console.log('  → App metadata');
  const meta = [
    { key: 'app.version', value: '0.1.0' },
    { key: 'app.seeded_at', value: new Date().toISOString() },
    { key: 'feature.ai_assistant', value: 'enabled' },
    { key: 'feature.backtesting', value: 'enabled' },
    { key: 'feature.live_trading', value: 'disabled' }, // paper only for now
  ];
  for (const m of meta) {
    await prisma.appMeta.upsert({
      where: { key: m.key },
      create: m,
      update: { value: m.value },
    });
  }

  // ---- Summary -------------------------------------------------------------
  const stats = {
    instruments: await prisma.instrument.count(),
    users: await prisma.user.count(),
    strategies: await prisma.strategy.count(),
    watchlistItems: await prisma.watchlistItem.count(),
    notifications: await prisma.notification.count(),
  };

  console.log('\n✓ Seed complete\n');
  console.table(stats);
  console.log('\nDemo account:');
  console.log('  Email:    demo@vector.io');
  console.log('  Password: demo123');
  console.log('  Balance:  $100,000 (paper)\n');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
