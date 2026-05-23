import { create } from 'zustand';
import type { Position, Order, Trade, Instrument, Candle, Strategy, RiskSettings, Notification } from '@/types';
import { DEFAULT_RISK_SETTINGS, ULTRA_SAFE_OVERRIDES } from '@/types';

// The preseeded instruments reference (synced with db seed for parity)
export const INSTRUMENTS_REF: Instrument[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', assetClass: 'equity',    risky: false, tickSize: 0.05,   minQty: 1      },
  { symbol: 'TCS',      name: 'Tata Consultancy',    assetClass: 'equity',    risky: false, tickSize: 0.05,   minQty: 1      },
  { symbol: 'INFY',     name: 'Infosys Ltd.',        assetClass: 'equity',    risky: false, tickSize: 0.05,   minQty: 1      },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.',      assetClass: 'equity',    risky: false, tickSize: 0.05,   minQty: 1      },
  { symbol: 'BTCUSD', name: 'Bitcoin',        assetClass: 'crypto',    risky: true,  tickSize: 0.01,   minQty: 0.0001 },
  { symbol: 'ETHUSD', name: 'Ethereum',       assetClass: 'crypto',    risky: true,  tickSize: 0.01,   minQty: 0.001  },
  { symbol: 'SOLUSD', name: 'Solana',         assetClass: 'crypto',    risky: true,  tickSize: 0.01,   minQty: 0.01   },
  { symbol: 'AVAXUSD',name: 'Avalanche',      assetClass: 'crypto',    risky: true,  tickSize: 0.01,   minQty: 0.01   },
  { symbol: 'AAPL',   name: 'Apple Inc.',     assetClass: 'equity',    risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'NVDA',   name: 'NVIDIA',         assetClass: 'equity',    risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'TSLA',   name: 'Tesla',          assetClass: 'equity',    risky: true,  tickSize: 0.01,   minQty: 1      },
  { symbol: 'MSFT',   name: 'Microsoft',      assetClass: 'equity',    risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'GOOGL',  name: 'Alphabet',       assetClass: 'equity',    risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'AMZN',   name: 'Amazon',         assetClass: 'equity',    risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'SPY',    name: 'S&P 500 ETF',    assetClass: 'etf',       risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'QQQ',    name: 'Nasdaq 100 ETF', assetClass: 'etf',       risky: false, tickSize: 0.01,   minQty: 1      },
  { symbol: 'GOLD',   name: 'Gold Spot',      assetClass: 'commodity', risky: false, tickSize: 0.10,   minQty: 0.01   },
  { symbol: 'OIL',    name: 'WTI Crude Oil',  assetClass: 'commodity', risky: true,  tickSize: 0.01,   minQty: 0.1    },
  { symbol: 'EURUSD', name: 'Euro / US Dollar',     assetClass: 'forex', risky: false, tickSize: 0.0001, minQty: 100  },
  { symbol: 'GBPUSD', name: 'British Pound / USD',  assetClass: 'forex', risky: false, tickSize: 0.0001, minQty: 100  },
];

interface LivePrice {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change24h: number;
  history: number[]; // 20 last ticks
  candles: Candle[];
}

interface TradeState {
  // Terminal Navigation
  activeTab: string;
  
  // User & Balances
  userId: string | null;
  balance: number;
  equity: number;
  initialBalance: number;
  dayPnl: number;
  winRate: number;
  
  // Watchlist & Selected
  selectedSymbol: string;
  watchlist: string[];
  
  // Market Ticks
  livePrices: Record<string, LivePrice>;
  instruments: Instrument[];
  marketDataSource: 'simulated' | 'real_nse';
  setMarketDataSource: (source: 'simulated' | 'real_nse') => void;
  
  // Trades, Positions, Orders
  positions: Position[];
  orders: Order[];
  tradeHistory: Trade[];
  
  // Risk & Settings
  riskSettings: RiskSettings;
  consecutiveLosses: number;
  
  // Strategies & Custom blocks
  strategies: Strategy[];
  customStrategiesCount: number;
  
  // Notifications
  notifications: Notification[];
  showNotificationsDrawer: boolean;
  
  // Core Setters
  setUserId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedSymbol: (symbol: string) => void;
  toggleWatchlist: (symbol: string) => void;
  setShowNotificationsDrawer: (show: boolean) => void;
  markNotificationsAsRead: () => void;
  addNotification: (type: Notification['type'], title: string, body: string) => void;
  
  // Trade Operations
  placeOrder: (order: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status' | 'filledQty' | 'fees'>) => { success: boolean; reason?: string };
  closePosition: (id: string, reason?: string) => void;
  toggleUltraSafeMode: () => void;
  resetPaperAccount: () => void;
  
  // Strategy Builder
  saveStrategy: (strategy: Strategy) => void;
  
  // Simulation Ticks
  initializePrices: () => void;
  tickPrices: () => Promise<void>;
}

// Seed helper functions
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeedCandles(sym: string, startPrice: number, count = 50): Candle[] {
  const rand = seededRandom(sym.charCodeAt(0) * 100 + sym.length);
  const candles: Candle[] = [];
  let price = startPrice * (0.95 + rand() * 0.1);
  const now = Date.now();
  const interval = 60000; // 1m

  for (let i = count - 1; i >= 0; i--) {
    const o = price;
    const drift = (rand() - 0.49) * 0.003 * price;
    const range = 0.004 * price * (0.5 + rand() * 1.5);
    const c = Math.max(0.01, o + drift);
    const h = Math.max(o, c) + rand() * range * 0.5;
    const l = Math.min(o, c) - rand() * range * 0.5;
    const v = Math.floor(5000 + rand() * 95000);

    candles.push({ t: now - i * interval, o, h, l, c, v });
    price = c;
  }
  return candles;
}

export const useTradeStore = create<TradeState>((set, get) => ({
  activeTab: 'dashboard',
  userId: null,
  balance: 100000,
  equity: 100000,
  initialBalance: 100000,
  dayPnl: 0,
  winRate: 58, // baseline placeholder
  
  selectedSymbol: 'RELIANCE',
  watchlist: ['RELIANCE', 'TCS', 'BTCUSD', 'ETHUSD', 'AAPL', 'NVDA', 'SPY', 'GOLD'],
  marketDataSource: 'real_nse',
  setMarketDataSource: (source) => set({ marketDataSource: source }),
  
  livePrices: {},
  instruments: INSTRUMENTS_REF,
  
  positions: [],
  orders: [],
  tradeHistory: [],
  
  riskSettings: DEFAULT_RISK_SETTINGS,
  consecutiveLosses: 0,
  
  strategies: [
    {
      id: 's1',
      userId: 'demo',
      name: 'Mean Reversion Long',
      description: 'Buy oversold pullbacks above the 50-period SMA',
      status: 'paper',
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        entryConditions: [
          { id: 'c1', type: 'rsi_below', params: { period: 14, threshold: 30 } },
          { id: 'c2', type: 'price_above_sma', params: { period: 50 } }
        ],
        exitConditions: [
          { id: 'x1', type: 'rsi_above', params: { period: 14, threshold: 60 } }
        ],
        riskPerTrade: 0.005,
        stopLossPct: 0.02,
        takeProfitPct: 0.04,
        symbols: ['AAPL', 'MSFT', 'SPY'],
        timeframe: '1h'
      }
    },
    {
      id: 's2',
      userId: 'demo',
      name: 'EMA 9/21 Crossover',
      description: 'Trend-following crypto crossover system',
      status: 'paper',
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        entryConditions: [
          { id: 'c1', type: 'sma_cross_up', params: { fast: 9, slow: 21 } }
        ],
        exitConditions: [
          { id: 'x1', type: 'sma_cross_down', params: { fast: 9, slow: 21 } }
        ],
        riskPerTrade: 0.01,
        stopLossPct: 0.015,
        takeProfitPct: 0.03,
        symbols: ['BTCUSD', 'ETHUSD'],
        timeframe: '15m'
      }
    }
  ] as Strategy[],
  customStrategiesCount: 2,
  
  notifications: [
    {
      id: 'n1',
      userId: 'demo',
      type: 'system',
      title: 'Welcome to Vector',
      body: 'Your paper account is funded with $100,000. Visit the Risk Center to configure Ultra Safe Mode.',
      read: false,
      createdAt: new Date()
    },
    {
      id: 'n2',
      userId: 'demo',
      type: 'risk_alert',
      title: 'Ultra Safe Mode available',
      body: 'New here? Enable Ultra Safe Mode to enforce strict 1% risk caps and filter out volatile assets.',
      read: false,
      createdAt: new Date(Date.now() - 600000)
    }
  ],
  showNotificationsDrawer: false,

  setUserId: (id) => set({ userId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  
  toggleWatchlist: (symbol) => set((state) => {
    const isWatch = state.watchlist.includes(symbol);
    return {
      watchlist: isWatch
        ? state.watchlist.filter(s => s !== symbol)
        : [...state.watchlist, symbol]
    };
  }),

  setShowNotificationsDrawer: (show) => set({ showNotificationsDrawer: show }),

  markNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  addNotification: (type, title, body) => set((state) => {
    const newNotif: Notification = {
      id: Math.random().toString(),
      userId: state.userId || 'demo',
      type,
      title,
      body,
      read: false,
      createdAt: new Date()
    };
    return { notifications: [newNotif, ...state.notifications] };
  }),

  toggleUltraSafeMode: () => set((state) => {
    const nextMode = !state.riskSettings.ultraSafeMode;
    const settings = nextMode 
      ? { ...DEFAULT_RISK_SETTINGS, ...ULTRA_SAFE_OVERRIDES, ultraSafeMode: true }
      : { ...DEFAULT_RISK_SETTINGS, ultraSafeMode: false };
    
    // Add Notification alert
    const newNotif: Notification = {
      id: Math.random().toString(),
      userId: state.userId || 'demo',
      type: 'risk_alert',
      title: nextMode ? 'Ultra Safe Mode Enabled' : 'Ultra Safe Mode Disabled',
      body: nextMode 
        ? 'Capital preservation rules are active. Volatile assets are blocked, and risk per trade is limited to 1%.'
        : 'Standard risk configurations restored. Dynamic portfolio sizing and high-volatility assets are enabled.',
      read: false,
      createdAt: new Date()
    };

    return { 
      riskSettings: settings,
      notifications: [newNotif, ...state.notifications]
    };
  }),

  resetPaperAccount: () => set((state) => {
    const welcomeNotif: Notification = {
      id: Math.random().toString(),
      userId: state.userId || 'demo',
      type: 'system',
      title: 'Account Reset Successfully',
      body: 'All positions, open orders, and trade histories have been cleared. Paper balance reset to $100,000.',
      read: false,
      createdAt: new Date()
    };
    return {
      balance: 100000,
      equity: 100000,
      dayPnl: 0,
      positions: [],
      orders: [],
      tradeHistory: [],
      consecutiveLosses: 0,
      notifications: [welcomeNotif, ...state.notifications]
    };
  }),

  placeOrder: (orderInput) => {
    const state = get();
    const live = state.livePrices[orderInput.symbol];
    if (!live) return { success: false, reason: 'Market data missing' };

    const price = orderInput.price || live.price;
    const notional = orderInput.qty * price;

    // 1. Ultra Safe check: Risk sizing check (Max 1% capital risk)
    if (state.riskSettings.ultraSafeMode) {
      // Risk is generally defined as distance to stop loss, or total exposure if no SL.
      const slPct = orderInput.stopLoss ? Math.abs((price - orderInput.stopLoss) / price) : 0.02; // assume 2% default risk
      const capitalRisk = notional * slPct;
      const maxRisk = state.equity * state.riskSettings.maxRiskPerTrade;
      
      if (capitalRisk > maxRisk) {
        return { 
          success: false, 
          reason: `Risk exceeds Ultra Safe cap of $${maxRisk.toFixed(2)} (1% of equity). Reduce Qty.` 
        };
      }

      // 2. Volatility asset check
      const assetDef = state.instruments.find(i => i.symbol === orderInput.symbol);
      if (assetDef?.risky) {
        return {
          success: false,
          reason: `Asset blocked: ${orderInput.symbol} is flagged volatile. Disable Ultra Safe Mode to trade.`
        };
      }

      // 3. Cooldown check
      if (state.consecutiveLosses >= state.riskSettings.maxConsecutiveLosses) {
        return {
          success: false,
          reason: `Trading cooldown active after ${state.consecutiveLosses} consecutive losses.`
        };
      }
    }

    if (notional > state.balance && orderInput.side === 'buy') {
      return { success: false, reason: 'Insufficient cash balance' };
    }

    const orderId = 'ord_' + Math.random().toString(36).substr(2, 9);
    const newOrder: Order = {
      id: orderId,
      userId: state.userId || 'demo',
      symbol: orderInput.symbol,
      side: orderInput.side,
      type: orderInput.type,
      qty: orderInput.qty,
      price: price,
      stopLoss: orderInput.stopLoss,
      takeProfit: orderInput.takeProfit,
      status: orderInput.type === 'market' ? 'filled' : 'pending',
      filledQty: orderInput.type === 'market' ? orderInput.qty : 0,
      fees: notional * 0.001, // 0.1% fees modeled
      createdAt: new Date(),
      strategyId: orderInput.strategyId,
      notes: orderInput.notes,
    };

    const updatedOrders = [...state.orders, newOrder];
    const updatedPositions = [...state.positions];
    let newCashBalance = state.balance;

    if (newOrder.status === 'filled') {
      newCashBalance -= (notional + newOrder.fees);
      
      // If position already exists, average it in. Otherwise create.
      const existingPosIdx = state.positions.findIndex(p => p.symbol === orderInput.symbol && p.side === orderInput.side);
      if (existingPosIdx !== -1) {
        const existing = state.positions[existingPosIdx];
        const newQty = existing.qty + orderInput.qty;
        const avgPrice = ((existing.qty * existing.entryPrice) + notional) / newQty;
        updatedPositions[existingPosIdx] = {
          ...existing,
          qty: newQty,
          entryPrice: avgPrice,
          markPrice: price,
          unrealizedPnl: orderInput.side === 'buy' ? (price - avgPrice) * newQty : (avgPrice - price) * newQty
        };
      } else {
        const positionId = 'pos_' + Math.random().toString(36).substr(2, 9);
        const newPos: Position = {
          id: positionId,
          userId: state.userId || 'demo',
          symbol: orderInput.symbol,
          side: orderInput.side,
          qty: orderInput.qty,
          entryPrice: price,
          markPrice: price,
          realizedPnl: 0,
          unrealizedPnl: 0,
          stopLoss: orderInput.stopLoss,
          takeProfit: orderInput.takeProfit,
          openedAt: new Date(),
          strategyId: orderInput.strategyId,
        };
        updatedPositions.push(newPos);
      }

      // Add notification
      const fillNotif: Notification = {
        id: Math.random().toString(),
        userId: state.userId || 'demo',
        type: 'trade_filled',
        title: `Order Filled: ${newOrder.side.toUpperCase()} ${newOrder.symbol}`,
        body: `Filled ${newOrder.qty} @ $${price.toFixed(2)}. Protective stop ${orderInput.stopLoss ? `@ $${orderInput.stopLoss}` : 'none'}.`,
        read: false,
        createdAt: new Date()
      };

      set({
        orders: updatedOrders,
        positions: updatedPositions,
        balance: newCashBalance,
        notifications: [fillNotif, ...state.notifications]
      });
    } else {
      // Pending order notification
      const pendNotif: Notification = {
        id: Math.random().toString(),
        userId: state.userId || 'demo',
        type: 'system',
        title: `Order Placed: ${newOrder.side.toUpperCase()} ${newOrder.symbol}`,
        body: `Placed ${newOrder.type} order for ${newOrder.qty} @ $${price.toFixed(2)}.`,
        read: false,
        createdAt: new Date()
      };

      set({
        orders: updatedOrders,
        notifications: [pendNotif, ...state.notifications]
      });
    }

    return { success: true };
  },

  closePosition: (id, reason = 'manual') => {
    const state = get();
    const pos = state.positions.find(p => p.id === id);
    if (!pos) return;

    const live = state.livePrices[pos.symbol];
    const price = live?.price || pos.entryPrice;
    
    // Calculate P&L
    const pnl = pos.side === 'buy' 
      ? (price - pos.entryPrice) * pos.qty
      : (pos.entryPrice - price) * pos.qty;

    const fees = pos.qty * price * 0.001;
    const finalReturn = (pos.qty * pos.entryPrice) + pnl - fees;

    // Track consecutive losses
    let nextLossStreak = state.consecutiveLosses;
    if (pnl < 0) {
      nextLossStreak += 1;
    } else if (pnl > 0) {
      nextLossStreak = 0; // resets on win
    }

    // Add Trade History entry
    const tradeId = 'trd_' + Math.random().toString(36).substr(2, 9);
    const newTrade: Trade = {
      id: tradeId,
      orderId: 'ord_close',
      symbol: pos.symbol,
      side: pos.side === 'buy' ? 'sell' : 'buy',
      qty: pos.qty,
      price: price,
      fees,
      pnl,
      ts: new Date(),
    };

    const notifType = pnl >= 0 ? 'take_profit_hit' : 'stop_loss_hit';
    const closeNotif: Notification = {
      id: Math.random().toString(),
      userId: state.userId || 'demo',
      type: reason === 'stop_loss' ? 'stop_loss_hit' : reason === 'take_profit' ? 'take_profit_hit' : 'trade_filled',
      title: `Closed ${pos.symbol} (${reason})`,
      body: `${pos.side === 'buy' ? 'LONG' : 'SHORT'} position closed @ $${price.toFixed(2)}. P&L: $${pnl.toFixed(2)} (${pnl >= 0 ? 'gain' : 'loss'}).`,
      read: false,
      createdAt: new Date()
    };

    set({
      positions: state.positions.filter(p => p.id !== id),
      balance: state.balance + finalReturn,
      tradeHistory: [newTrade, ...state.tradeHistory],
      consecutiveLosses: nextLossStreak,
      notifications: [closeNotif, ...state.notifications]
    });
  },

  saveStrategy: (strat) => set((state) => {
    const existingIdx = state.strategies.findIndex(s => s.id === strat.id);
    const list = [...state.strategies];
    if (existingIdx !== -1) {
      list[existingIdx] = strat;
    } else {
      list.push(strat);
    }
    return { strategies: list };
  }),

  initializePrices: () => set((state) => {
    const initPrices: Record<string, LivePrice> = {};
    const refCandles = {
      RELIANCE: 2450.00, TCS: 3850.00, INFY: 1420.00, HDFCBANK: 1610.00,
      BTCUSD: 67234.50, ETHUSD: 3245.80, SOLUSD: 142.30, AVAXUSD: 38.50,
      AAPL: 218.45, NVDA: 478.20, TSLA: 245.67, MSFT: 412.80, GOOGL: 178.20, AMZN: 198.40,
      SPY: 542.18, QQQ: 478.30, GOLD: 2398.40, OIL: 78.45, EURUSD: 1.0834, GBPUSD: 1.2645
    };

    state.instruments.forEach(inst => {
      const ref = refCandles[inst.symbol as keyof typeof refCandles] || 100.00;
      const baseCandles = generateSeedCandles(inst.symbol, ref, 60);
      const last = baseCandles[baseCandles.length - 1].c;
      const spreads = last * 0.0003;

      initPrices[inst.symbol] = {
        symbol: inst.symbol,
        price: last,
        bid: last - spreads,
        ask: last + spreads,
        change24h: ((last - baseCandles[0].c) / baseCandles[0].c) * 100,
        history: baseCandles.slice(-20).map(c => c.c),
        candles: baseCandles,
      };
    });

    return { livePrices: initPrices };
  }),

  tickPrices: async () => {
    const state = get();
    const nextPrices = { ...state.livePrices };

    const promises = state.instruments.map(async (inst) => {
      const curr = state.livePrices[inst.symbol];
      if (!curr) return;

      let nextPrice = curr.price;
      let nextChange = curr.change24h;

      const isActiveOrWatched = state.watchlist.includes(inst.symbol) || state.selectedSymbol === inst.symbol;

      if (isActiveOrWatched && state.marketDataSource === 'real_nse') {
        try {
          const res = await fetch(`/api/market/nse?symbol=${inst.symbol}`);
          if (res.ok) {
            const data = await res.json();
            if (data.price) {
              nextPrice = data.price;
              nextChange = data.change24h ?? curr.change24h;
            }
          }
        } catch (err) {
          // Fallback to high-fidelity drift simulator
          const refVols = {
            BTCUSD: 0.0018, ETHUSD: 0.0022, SOLUSD: 0.0035, AVAXUSD: 0.0040,
            AAPL: 0.0008, NVDA: 0.0015, TSLA: 0.0025, MSFT: 0.0007, GOOGL: 0.0009, AMZN: 0.0010,
            SPY: 0.0005, QQQ: 0.0006, GOLD: 0.0006, OIL: 0.0020, EURUSD: 0.0003, GBPUSD: 0.0004
          };
          const vol = refVols[inst.symbol as keyof typeof refVols] || 0.001;
          const drift = (Math.random() - 0.5) * vol * curr.price * 1.8;
          nextPrice = Math.max(0.01, curr.price + drift);
        }
      } else {
        const refVols = {
          BTCUSD: 0.0018, ETHUSD: 0.0022, SOLUSD: 0.0035, AVAXUSD: 0.0040,
          AAPL: 0.0008, NVDA: 0.0015, TSLA: 0.0025, MSFT: 0.0007, GOOGL: 0.0009, AMZN: 0.0010,
          SPY: 0.0005, QQQ: 0.0006, GOLD: 0.0006, OIL: 0.0020, EURUSD: 0.0003, GBPUSD: 0.0004
        };
        const vol = refVols[inst.symbol as keyof typeof refVols] || 0.001;
        const drift = (Math.random() - 0.5) * vol * curr.price * 1.8;
        nextPrice = Math.max(0.01, curr.price + drift);
      }

      const spreads = nextPrice * 0.0003;
      const nextHistory = [...curr.history, nextPrice].slice(-20);
      
      const nextCandles = [...curr.candles];
      const lastCandle = nextCandles[nextCandles.length - 1];
      if (lastCandle) {
        lastCandle.c = nextPrice;
        lastCandle.h = Math.max(lastCandle.h, nextPrice);
        lastCandle.l = Math.min(lastCandle.l, nextPrice);
      }

      nextPrices[inst.symbol] = {
        ...curr,
        price: nextPrice,
        bid: nextPrice - spreads,
        ask: nextPrice + spreads,
        change24h: nextChange,
        history: nextHistory,
        candles: nextCandles,
      };
    });

    await Promise.all(promises);

    // Recalculate Position Mark prices and Unrealized P&L
    let posPnl = 0;
    const nextPositions = state.positions.map(p => {
      const mark = nextPrices[p.symbol]?.price || p.entryPrice;
      const pnl = p.side === 'buy' 
        ? (mark - p.entryPrice) * p.qty
        : (p.entryPrice - mark) * p.qty;
      posPnl += pnl;

      // Auto-trigger protective stops simulation
      if (p.stopLoss && ((p.side === 'buy' && mark <= p.stopLoss) || (p.side === 'sell' && mark >= p.stopLoss))) {
        setTimeout(() => get().closePosition(p.id, 'stop_loss'), 50);
      }
      if (p.takeProfit && ((p.side === 'buy' && mark >= p.takeProfit) || (p.side === 'sell' && mark <= p.takeProfit))) {
        setTimeout(() => get().closePosition(p.id, 'take_profit'), 50);
      }

      return {
        ...p,
        markPrice: mark,
        unrealizedPnl: pnl,
      };
    });

    const nextEquity = state.balance + posPnl;

    set({
      livePrices: nextPrices,
      positions: nextPositions,
      equity: nextEquity,
      dayPnl: nextEquity - state.initialBalance
    });
  }
}));
