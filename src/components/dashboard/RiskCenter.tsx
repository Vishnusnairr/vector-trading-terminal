'use client';

import React, { useMemo } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Shield, AlertTriangle, CheckCircle2, Target, Sliders, TrendingDown, Gauge } from 'lucide-react';
import { fmt } from '@/lib/format';

interface RiskGaugeProps {
  score: number;
  ultraSafe: boolean;
}

function RiskGauge({ score, ultraSafe }: RiskGaugeProps) {
  const adjusted = ultraSafe ? Math.min(score, 25) : score;
  const angle = (adjusted / 100) * 180 - 90;
  const color = adjusted < 30 ? 'var(--color-bull)' : adjusted < 60 ? 'var(--color-amber)' : 'var(--color-bear)';

  return (
    <div className="panel flex flex-col items-center justify-center p-6 text-center">
      <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute mb-4 self-start">
        Dynamic Risk Score
      </span>
      
      <svg viewBox="0 0 200 120" className="w-full max-w-[210px] overflow-visible">
        <defs>
          <linearGradient id="riskGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--color-bull)" />
            <stop offset="50%" stopColor="var(--color-amber)" />
            <stop offset="100%" stopColor="var(--color-bear)" />
          </linearGradient>
        </defs>
        
        {/* Speedometer Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Active Arc fill */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#riskGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(adjusted / 100) * 251.2} 251.2`}
        />
        
        {/* Needle pointer */}
        <g
          transform={`rotate(${angle} 100 100)`}
          className="transition-transform duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="38"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={color} />
        </g>
      </svg>
      
      <div className="mt-2 font-display text-4xl font-extrabold tracking-tight" style={{ color }}>
        {adjusted}
      </div>
      <div className="font-mono text-[9px] font-bold tracking-widest text-fg-mute uppercase mt-1">
        {adjusted < 30 ? 'CONSERVATIVE' : adjusted < 60 ? 'MODERATE' : 'AGGRESSIVE'}
      </div>

      {ultraSafe && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 font-mono text-[9px] font-semibold text-brand-cyan uppercase tracking-wider">
          <Shield size={10} />
          CAPPED BY ULTRA SAFE
        </div>
      )}
    </div>
  );
}

export default function RiskCenter() {
  const { positions, balance, equity, riskSettings, consecutiveLosses, tradeHistory } = useTradeStore();

  const isUSM = riskSettings.ultraSafeMode;

  const totalExposure = useMemo(() => {
    return positions.reduce((acc, pos) => acc + pos.qty * pos.entryPrice, 0);
  }, [positions]);

  const exposureRatio = (totalExposure / equity) * 100;

  // Emotional flags evaluator
  const riskScoreValue = useMemo(() => {
    let base = 15;
    if (exposureRatio > 40) base += 20;
    if (exposureRatio > 80) base += 25;
    if (consecutiveLosses > 0) base += consecutiveLosses * 12;
    if (positions.length > 3) base += 15;
    return Math.min(100, base);
  }, [exposureRatio, consecutiveLosses, positions]);

  const riskMetrics = [
    {
      label: 'Exposure Ratio',
      value: `${exposureRatio.toFixed(1)}%`,
      status: exposureRatio < 30 ? 'good' : exposureRatio < 60 ? 'warn' : 'bad',
      desc: `${fmt.money(totalExposure)} open exposure vs. capital pool`,
      width: exposureRatio,
      color: exposureRatio < 30 ? 'bg-bull' : exposureRatio < 60 ? 'bg-brand-amber' : 'bg-bear',
    },
    {
      label: 'Consecutive Losses',
      value: consecutiveLosses.toString(),
      status: consecutiveLosses < riskSettings.maxConsecutiveLosses ? 'good' : 'bad',
      desc: `Mandatory cooling trigger limit @ ${riskSettings.maxConsecutiveLosses} losses`,
      width: (consecutiveLosses / riskSettings.maxConsecutiveLosses) * 100,
      color: consecutiveLosses < riskSettings.maxConsecutiveLosses ? 'bg-bull' : 'bg-bear',
    },
    {
      label: 'Daily Drawdown',
      value: `${equity < balance ? '-' : ''}${Math.abs(((equity - balance) / balance) * 100).toFixed(2)}%`,
      status: Math.abs(((equity - balance) / balance)) < riskSettings.dailyLossLimit ? 'good' : 'bad',
      desc: `Capital protection limit: ${riskSettings.dailyLossLimit * 100}% loss limit`,
      width: (Math.abs(((equity - balance) / balance)) / riskSettings.dailyLossLimit) * 100,
      color: Math.abs(((equity - balance) / balance)) < riskSettings.dailyLossLimit ? 'bg-bull' : 'bg-bear',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Ultra Safe Summary banner */}
      {isUSM && (
        <div className="relative overflow-hidden rounded-xl border border-brand-cyan/25 bg-gradient-to-br from-brand-cyan/[0.07] to-bull/[0.04] p-5">
          <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-brand-cyan/5 blur-[80px]" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Shield size={16} />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-sm font-bold text-fg">
                Ultra Safe Mode is Active
              </h2>
              <p className="font-sans text-[11.5px] leading-relaxed text-fg-dim">
                Vector is enforcing institutional-grade risk limits. Trades on highly volatile cryptos/stocks are blocked, maximum risk per transaction is strictly capped to 1% of total equity, and trading triggers a cooldown if consecutive losses occur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary stats rows */}
      <div className="grid gap-4 md:grid-cols-3">
        {riskMetrics.map((metric, i) => (
          <div key={i} className="panel p-4 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                {metric.label}
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-fg tabular">
                {metric.value}
              </div>
              <div className="mt-1 text-[10.5px] text-fg-mute font-sans">{metric.desc}</div>
            </div>
            <div className="mt-4 h-1.5 w-full rounded bg-bg-elevated/40 overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-[600ms] ${metric.color}`}
                style={{ width: `${Math.min(100, metric.width)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Speedometer and Flags Layout */}
      <div className="grid gap-4 md:grid-cols-[1fr_1.8fr]">
        <RiskGauge score={riskScoreValue} ultraSafe={isUSM} />
        
        {/* Behavioral Flags Audit */}
        <div className="panel p-5">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute mb-4 block">
            Behavioral Risk Flags
          </span>

          <div className="space-y-3">
            {[
              {
                ok: consecutiveLosses < 2,
                label: 'Revenge Trading Guard',
                desc: consecutiveLosses < 2 
                  ? 'No signs of revenge entries. Position sizes remain stable.'
                  : 'Revenge trading warning: Multiple fast trades initiated following losses.',
              },
              {
                ok: exposureRatio <= 50,
                label: 'Capital Leverage Exposure',
                desc: exposureRatio <= 50
                  ? 'Exposure within optimal parameters. Safe liquidity pool retained.'
                  : 'Overexposure warning: More than 50% of capital locked in open positions.',
              },
              {
                ok: isUSM,
                label: 'Volatility Asset Blocker',
                desc: isUSM
                  ? 'Active. Volatile crypto/equity asset classes are locked down.'
                  : 'Inactive. Highly volatile instruments are open to order tickets.',
              },
              {
                ok: consecutiveLosses < riskSettings.maxConsecutiveLosses,
                label: 'Terminal Cooldown Guard',
                desc: consecutiveLosses < riskSettings.maxConsecutiveLosses
                  ? 'No active cooling limitations. Standard access granted.'
                  : 'Active. Cooldown restriction triggered due to back-to-back losses.',
              },
            ].map((flag, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  flag.ok
                    ? 'border-bull/20 bg-bull/[0.02] text-bull'
                    : 'border-brand-amber/35 bg-brand-amber/[0.02] text-brand-amber'
                }`}
              >
                {flag.ok ? (
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                )}
                <div className="space-y-0.5">
                  <h3 className="font-display text-xs font-semibold text-fg">
                    {flag.label}
                  </h3>
                  <p className="font-sans text-[11px] text-fg-dim">
                    {flag.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
