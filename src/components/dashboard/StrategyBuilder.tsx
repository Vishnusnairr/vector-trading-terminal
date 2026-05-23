'use client';

import React, { useState } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Plus, Play, ChevronDown, Activity, Shield, Sparkles, AlertCircle, BarChart3 } from 'lucide-react';
import type { Strategy, StrategyConfig } from '@/types';
import { saveStrategyAction } from '@/app/actions/actions';

export default function StrategyBuilder() {
  const { strategies, saveStrategy, userId } = useTradeStore();
  const [activeStrategyIdx, setActiveStrategyIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeStrat = strategies[activeStrategyIdx];

  const handleAddCondition = () => {
    if (!activeStrat) return;
    const newCond = {
      id: 'c_' + Math.random().toString(36).substr(2, 5),
      type: 'rsi_below' as const,
      params: { period: 14, threshold: 30 },
    };
    const updated: Strategy = {
      ...activeStrat,
      config: {
        ...activeStrat.config,
        entryConditions: [...activeStrat.config.entryConditions, newCond],
      },
    };
    saveStrategy(updated);
  };

  const handleSaveDb = async () => {
    if (!activeStrat) return;
    setSaving(true);
    setSuccessMsg(null);

    const res = await saveStrategyAction({
      userId: userId || 'demo',
      name: activeStrat.name,
      description: activeStrat.description || '',
      status: activeStrat.status,
      config: activeStrat.config,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Strategy configuration synchronized to local DB!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  if (!activeStrat) {
    return (
      <div className="panel p-6 text-center text-fg-mute font-mono text-xs">
        Create a strategy to begin building blocks...
      </div>
    );
  }

  return (
    <div className="panel flex flex-col p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-wider text-fg-mute">
            No-Code Architect
          </span>
          <h2 className="font-display text-sm font-bold text-fg">
            Strategy: {activeStrat.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDb}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 px-3 py-1.5 font-mono text-[10px] font-semibold text-brand-cyan uppercase tracking-wider transition-all hover:bg-brand-cyan/20"
          >
            {saving ? 'Syncing...' : 'Save Strategy'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 rounded-lg border border-bull/20 bg-bull/5 p-2 text-center text-xs text-bull">
          {successMsg}
        </div>
      )}

      {/* Conditions Blocks list */}
      <div className="flex-1 space-y-3">
        {activeStrat.config.entryConditions.map((cond, i) => (
          <div key={cond.id} className="relative">
            <div className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Activity size={14} />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-fg-mute">
                    {i === 0 ? 'IF ENTRY RULE' : 'AND ENTRY RULE'}
                  </span>
                  <div className="font-display text-xs font-semibold text-fg">
                    {cond.type === 'rsi_below'
                      ? `RSI(${cond.params.period || 14}) is below ${cond.params.threshold || 30}`
                      : cond.type === 'price_above_sma'
                      ? `Price is above SMA(${cond.params.period || 50})`
                      : `Fast EMA crossover above Slow EMA`}
                  </div>
                </div>
              </div>
            </div>

            {i < activeStrat.config.entryConditions.length - 1 && (
              <div className="flex justify-center py-1">
                <ChevronDown size={14} className="text-fg-mute" />
              </div>
            )}
          </div>
        ))}

        <button
          onClick={handleAddCondition}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 bg-transparent py-3 font-mono text-[10.5px] text-fg-dim transition-colors hover:border-brand-cyan hover:text-fg"
        >
          <Plus size={12} />
          Add Condition Rule Block
        </button>
      </div>

      {/* Ratios and Bracket Settings */}
      <div className="mt-5 border-t border-border/50 pt-4 space-y-3">
        <span className="font-mono text-[9px] uppercase tracking-wider text-fg-mute">
          Risk & Protective Bracket Levels
        </span>
        <div className="grid grid-cols-3 gap-3 text-xs font-sans">
          <div className="rounded-lg bg-bg-elevated/20 border border-border/60 p-2.5">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-fg-mute mb-1">
              Risk/Trade
            </div>
            <div className="font-mono font-bold text-fg">
              {(activeStrat.config.riskPerTrade * 100).toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg bg-bg-elevated/20 border border-border/60 p-2.5">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-fg-mute mb-1">
              Stop Loss
            </div>
            <div className="font-mono font-bold text-bear">
              {(activeStrat.config.stopLossPct * 100).toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg bg-bg-elevated/20 border border-border/60 p-2.5">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-fg-mute mb-1">
              Take Profit
            </div>
            <div className="font-mono font-bold text-bull">
              {(activeStrat.config.takeProfitPct * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
