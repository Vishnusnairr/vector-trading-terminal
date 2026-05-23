'use client';

import React, { useState } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { useSession } from 'next-auth/react';
import { Lock, RefreshCw, Key, ShieldAlert, Sparkles } from 'lucide-react';
import { fmt } from '@/lib/format';
import { resetPaperAccountAction } from '@/app/actions/actions';

export default function SettingsPanel() {
  const { data: session } = useSession();
  const { balance, resetPaperAccount, userId, marketDataSource, setMarketDataSource } = useTradeStore();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to clear your trade logs, positions, and restore balance to $100,000?')) return;
    
    setResetting(true);
    setResetSuccess(false);
    
    // Server-side DB reset
    await resetPaperAccountAction(userId || 'demo');
    
    // Client-side Zustand reset
    resetPaperAccount();
    
    setResetting(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Account Settings */}
      <div className="panel p-5 flex flex-col justify-between">
        <div>
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute mb-4 block">
            Paper Account Settings
          </span>

          <div className="divide-y divide-border/40 text-xs">
            <div className="flex justify-between py-2.5 font-sans">
              <span className="text-fg-dim">Email Address</span>
              <span className="font-mono text-fg">{session?.user?.email || 'demo@vector.io'}</span>
            </div>
            <div className="flex justify-between py-2.5 font-sans">
              <span className="text-fg-dim">Trader Profile</span>
              <span className="font-mono text-fg">{session?.user?.name || 'Demo Account'}</span>
            </div>
            <div className="flex justify-between py-2.5 font-sans">
              <span className="text-fg-dim">Cash Balance</span>
              <span className="font-mono text-fg">{fmt.money(balance)}</span>
            </div>
            <div className="flex justify-between py-2.5 font-sans">
              <span className="text-fg-dim">Account Status</span>
              <span className="font-mono text-bull font-semibold uppercase tracking-wider">Seeded · Sandbox Ready</span>
            </div>
            <div className="py-3 font-sans">
              <span className="mb-2 block font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                Market Price Feed Stream
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMarketDataSource('real_nse')}
                  className={`rounded-lg border py-2 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    marketDataSource === 'real_nse'
                      ? 'border-brand-cyan/45 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                      : 'border-border bg-bg-elevated/10 text-fg-dim hover:bg-bg-elevated/20'
                  }`}
                >
                  NSE Real-Time REST
                </button>
                <button
                  type="button"
                  onClick={() => setMarketDataSource('simulated')}
                  className={`rounded-lg border py-2 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    marketDataSource === 'simulated'
                      ? 'border-brand-cyan/45 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                      : 'border-border bg-bg-elevated/10 text-fg-dim hover:bg-bg-elevated/20'
                  }`}
                >
                  Volatility Simulator
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border/50 pt-4 space-y-2">
          {resetSuccess && (
            <div className="rounded-lg border border-bull/20 bg-bull/5 p-2 text-center text-xs text-bull">
              Capital allocations and trade history reset successfully!
            </div>
          )}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-bear/35 bg-bear/10 py-2.5 font-mono text-xs font-bold text-bear transition-all hover:bg-bear hover:text-fg disabled:opacity-50"
          >
            <RefreshCw size={12} className={resetting ? 'animate-spin' : ''} />
            {resetting ? 'Clearing accounts...' : 'Reset Paper Account & History'}
          </button>
        </div>
      </div>

      {/* API Key Connectors */}
      <div className="panel p-5">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute mb-4 block">
          Broker Integrations
        </span>

        <div className="space-y-3">
          {[
            { name: 'Alpaca Trade API', type: 'US Equities / Options' },
            { name: 'Binance exchange API', type: 'Crypto Asset classes' },
            { name: 'OpenAI Developer API', type: 'AI Assistant Reasoning' },
          ].map((broker, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated/25 p-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <Key size={13} className="text-fg-mute" />
                <div className="space-y-0.5">
                  <div className="font-display font-semibold text-fg">{broker.name}</div>
                  <div className="font-mono text-[9px] text-fg-mute">{broker.type}</div>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-brand-cyan/35 bg-brand-cyan/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-brand-cyan uppercase tracking-wider transition-colors hover:bg-brand-cyan/20"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
