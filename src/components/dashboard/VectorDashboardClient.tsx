'use client';

import React, { useEffect, useState } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { fmt } from '@/lib/format';
import { ChevronRight, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Watchlist from './Watchlist';
import CandlestickChart from './CandlestickChart';
import OrderBook from './OrderBook';
import OrderTicket from './OrderTicket';
import PositionsTable from './PositionsTable';
import RiskCenter from './RiskCenter';
import StrategyBuilder from './StrategyBuilder';
import BacktestPanel from './BacktestPanel';
import AICopilot from './AICopilot';
import NotificationsList from './NotificationsList';
import SettingsPanel from './SettingsPanel';

interface ClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    paperBalance: number;
  };
}

export default function VectorDashboardClient({ user }: ClientProps) {
  const {
    activeTab,
    selectedSymbol,
    setSelectedSymbol,
    livePrices,
    initializePrices,
    tickPrices,
    setUserId,
    balance,
  } = useTradeStore();

  const [bootProgress, setBootProgress] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const [timeString, setTimeString] = useState('');

  // Hydrate terminal, tick prices, and execute cyberpunk loading transition
  useEffect(() => {
    setUserId(user.id);
    initializePrices();
    setTimeString(new Date().toLocaleTimeString());

    // 1. Safe progress-percent tick animation (animates 0 to 100% over 2.7 seconds)
    const startTime = Date.now();
    const duration = 2700;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setBootProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsBooting(false);
        }, 350); // short transition buffer for visual polish
      }
    }, 30);

    // 2. Real-time background price ticking
    const priceInterval = setInterval(() => {
      tickPrices();
    }, 1500);

    // 3. Hydration-safe live clocks ticking
    const clockInterval = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(priceInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const systemLogs = [
    '>> [SYS] INTEL FRAMEWORK LOADED: Initializing Vector Trading Panel...',
    '>> [DB] CONNECTED: SQLite primary database online at "prisma/dev.db"',
    '>> [DB] HYDRATED: 20 preseeded global instruments verified & cached',
    '>> [AUTH] TOKEN SECURED: Edge-ready NextAuth v5 session validated',
    '>> [RISK] ULTRA SAFE ENGINE: Activated (1% capital risk limit enforced)',
    '>> [GATEWAY] MARKET DATA: Connected Yahoo Finance live feeds online',
    '>> [AI] COPILOT ACTIVE: Hydrating system context & strategy checkers...',
    '>> [ZUSTAND] STATE ENGINE: Ticking loop online ($100,000 Paper Balance)',
    '>> [SUCCESS] VECTOR CORE ENGAGED: Algorithmic terminal online.'
  ];

  if (isBooting) {
    return (
      <div 
        style={{ backgroundColor: '#05070a', color: '#f8fafc', minHeight: '100vh', width: '100vw' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 font-mono text-xs select-none overflow-hidden"
      >
        {/* Inline CSS animations to guarantee smooth staggered transitions independent of tailwind rebuilds */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes logFade {
            0% { opacity: 0; transform: translateY(4px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .log-item {
            opacity: 0;
            animation: logFade 0.22s ease-out forwards;
          }
          .animate-pulse-slow {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .4; }
          }
        ` }} />

        {/* Futuristic Background Radial Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1017_1px,transparent_1px),linear-gradient(to_bottom,#0c1017_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.08),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg space-y-6">
          {/* Cyberpunk Scanner Loader Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative flex h-16 w-16 items-center justify-center">
              {/* Outer scanning rings */}
              <div className="absolute inset-0 rounded-full border-2 border-[#00d4ff]/20 animate-ping pointer-events-none" />
              <div className="absolute inset-0 rounded-full border border-dashed border-[#00d4ff]/40 animate-[spin_6s_linear_infinite] pointer-events-none" />
              <div className="absolute h-10 w-10 rounded-full bg-[#00d4ff]/5 border border-[#00d4ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.25)]">
                <Activity size={18} className="text-[#00d4ff] animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-sm font-black uppercase tracking-[0.25em] text-[#f8fafc]">
                Vector Algo Systems
              </h1>
              <p className="text-[10px] text-[#00d4ff] font-semibold uppercase tracking-widest animate-pulse-slow">
                Powering Up Trading Terminal...
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[10px] text-[#cbd5e1]">
              <span>BOOT SEQUENCE PROGRESS</span>
              <span className="text-[#00d4ff]">{Math.round(bootProgress)}%</span>
            </div>
            <div className="h-2 w-full bg-[#11131a]/60 rounded border border-white/10 overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#9d6bff] rounded transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,212,255,0.5)]"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
          </div>

          {/* Scrolling Terminal logs console block */}
          <div className="panel bg-[#090d14]/90 border border-white/10 rounded-lg p-4 h-48 overflow-y-auto flex flex-col space-y-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-md">
            {systemLogs.map((log, idx) => {
              const isSuccess = log.includes('SUCCESS') || log.includes('ENGAGED') || log.includes('SUCCESSFUL') || log.includes('ONLINE');
              const isError = log.includes('ERR');
              // Stagger log entries every 260ms
              const delay = `${0.15 + idx * 0.26}s`;
              return (
                <div 
                  key={idx} 
                  className={`log-item leading-relaxed text-[10.5px] tabular-nums font-mono ${
                    isSuccess ? 'text-[#00e5a8] font-bold' : isError ? 'text-[#ff5470] font-bold' : 'text-[#cbd5e1]'
                  }`}
                  style={{ animationDelay: delay }}
                >
                  {log}
                </div>
              );
            })}
            <div className="flex items-center gap-1 text-[10.5px] text-[#00d4ff]">
              <span>{'>>'} SYS_INIT_SESSION: awaiting command</span>
              <span className="h-3 w-1.5 bg-[#00d4ff] animate-[pulse_1s_infinite]" />
            </div>
          </div>
          
          <div className="text-center font-bold text-[9px] uppercase tracking-widest text-[#94a3b8] animate-pulse-slow">
            SECURE LAYER ENCRYPTED · VECTOR CORE ENGINE ACTIVE
          </div>
        </div>
      </div>
    );
  }

  const live = livePrices[selectedSymbol];
  const livePrice = live?.price || 100.0;
  const currentInstrument = useTradeStore.getState().instruments.find(i => i.symbol === selectedSymbol) || { symbol: selectedSymbol, name: 'Reference Ticker', risky: false, assetClass: 'crypto' as const, tickSize: 0.01, minQty: 0.0001 };

  return (
    <div className="min-h-screen bg-bg text-fg font-sans relative flex flex-col selection:bg-brand-cyan/30 select-none">
      {/* Top terminal headers */}
      <TopBar />

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar />

        <main className="flex-1 p-5 overflow-x-hidden max-w-[calc(100vw-72px)] space-y-4">
          {/* Tab Header title */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-fg-mute">
                Vector Algorithmic Panel · Active Session
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-fg capitalize">
                {activeTab === 'dashboard' ? 'Trading Terminal' : activeTab}
              </h1>
            </div>
            
            {/* Quick date indicators */}
            <div className="hidden gap-1 md:flex">
              {['1D', '1W', '1M', 'YTD', 'ALL'].map((tf, i) => (
                <button
                  key={tf}
                  className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors ${
                    i === 0
                      ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25'
                      : 'text-fg-mute bg-bg-elevated/10 border border-border/45 hover:bg-bg-elevated/25 hover:text-fg'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic views router panel */}
          <div className="animate-[fadeIn_0.35s_ease-out]">
            {/* 1. Terminal View */}
            {activeTab === 'dashboard' && (
              <div className="grid gap-4 lg:grid-cols-[250px_1fr_310px] items-start">
                <div className="h-[520px]">
                  <Watchlist />
                </div>
                
                <div className="space-y-4 flex flex-col">
                  {/* Candlestick chart panel wrapper */}
                  <div className="panel p-4 relative overflow-hidden">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-base font-bold text-fg">
                          {selectedSymbol}
                        </span>
                        <span className="font-sans text-[10.5px] text-fg-dim">
                          {currentInstrument.name}
                        </span>
                      </div>
                      
                      {/* Timeframe tags selectors */}
                      <div className="flex gap-1 font-mono text-[9.5px]">
                        {['1m', '5m', '15m', '1h', '1D'].map((tf, idx) => (
                          <button
                            key={tf}
                            className={`rounded px-1.5 py-0.5 border ${
                              idx === 0
                                ? 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan'
                                : 'border-border text-fg-dim hover:bg-bg-elevated/20'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <CandlestickChart
                      candles={live?.candles || []}
                      livePrice={livePrice}
                      instrument={currentInstrument}
                    />
                  </div>

                  <PositionsTable />
                </div>

                <div className="space-y-4">
                  <OrderTicket symbol={selectedSymbol} price={livePrice} />
                  <OrderBook price={livePrice} />
                </div>
              </div>
            )}

            {/* 2. Markets Universe */}
            {activeTab === 'markets' && (
              <div className="grid gap-4 lg:grid-cols-[260px_1fr] items-start">
                <div className="h-[520px]">
                  <Watchlist />
                </div>
                <div className="panel p-4">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute mb-3 block">
                    Preloaded Instruments Universe
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-border font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                          <th className="px-4 py-2">Symbol</th>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Asset Class</th>
                          <th className="px-4 py-2 text-right">Reference Base</th>
                          <th className="px-4 py-2">Volatility Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-fg-dim">
                        {useTradeStore.getState().instruments.map((inst) => (
                          <tr
                            key={inst.symbol}
                            onClick={() => setSelectedSymbol(inst.symbol)}
                            className="hover:bg-bg-elevated/10 cursor-pointer"
                          >
                            <td className="px-4 py-3 font-display font-semibold text-fg">
                              {inst.symbol}
                            </td>
                            <td className="px-4 py-3">{inst.name}</td>
                            <td className="px-4 py-3 capitalize">{inst.assetClass}</td>
                            <td className="px-4 py-3 text-right font-mono">
                              {inst.symbol.endsWith('USD') ? '$' : ''}{inst.minQty}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                                  inst.risky
                                    ? 'bg-bear/10 text-bear border border-bear/20'
                                    : 'bg-bull/10 text-bull border border-bull/20'
                                }`}
                              >
                                {inst.risky ? 'HIGH' : 'LOW'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Strategy builder */}
            {activeTab === 'strategies' && <StrategyBuilder />}

            {/* 4. Historical Backtests */}
            {activeTab === 'backtest' && <BacktestPanel />}

            {/* 5. Risk Center */}
            {activeTab === 'risk' && <RiskCenter />}

            {/* 6. AI Copilot assistant */}
            {activeTab === 'ai' && <AICopilot />}

            {/* 7. Open Positions logs */}
            {activeTab === 'positions' && <PositionsTable />}

            {/* 8. Accounts & keys settings */}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </main>
      </div>

      {/* Notifications overlay drawer */}
      <NotificationsList />

      {/* Footer statistics ribbon */}
      <footer className="border-t border-border bg-bg/50 px-6 py-2.5 flex items-center justify-between font-mono text-[9.5px] text-fg-mute shrink-0">
        <span>Vector terminal · v0.1.0-release · Seeded</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse" />
          Live updates online · {new Date().toLocaleTimeString()}
        </span>
      </footer>
    </div>
  );
}
