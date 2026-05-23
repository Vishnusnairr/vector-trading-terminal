'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Plus, Lock } from 'lucide-react';
import { fmt } from '@/lib/format';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color, width = 65, height = 24 }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * width},${
          height - ((v - min) / range) * height
        }`
    )
    .join(' ');

  return (
    <svg width={width} height={height} className="block overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PriceLabelProps {
  value: number;
  symbol: string;
}

function FlashPrice({ value, symbol }: PriceLabelProps) {
  const prevVal = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevVal.current !== value) {
      setFlash(value > prevVal.current ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 300);
      prevVal.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const colorClass =
    flash === 'up'
      ? 'text-bull font-bold'
      : flash === 'down'
      ? 'text-bear font-bold'
      : 'text-fg';

  return (
    <span className={`tabular font-mono text-xs transition-colors duration-300 ${colorClass}`}>
      {fmt.price(value, symbol.endsWith('USD') && !symbol.startsWith('BTC') && !symbol.startsWith('ETH') ? 2 : symbol.includes('EUR') || symbol.includes('GBP') ? 4 : 2)}
    </span>
  );
}

export default function Watchlist() {
  const {
    instruments,
    livePrices,
    selectedSymbol,
    setSelectedSymbol,
    watchlist,
    riskSettings,
  } = useTradeStore();

  const isUSM = riskSettings.ultraSafeMode;

  return (
    <div className="panel flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute">
          Watchlist
        </span>
        <button className="text-fg-mute transition-colors hover:text-fg">
          <Plus size={14} />
        </button>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.map((symbol) => {
          const inst = instruments.find((i) => i.symbol === symbol);
          const live = livePrices[symbol];
          if (!inst || !live) return null;

          const change = live.change24h;
          const isPositive = change >= 0;
          const blocked = isUSM && inst.risky;
          const isSelected = selectedSymbol === symbol;

          return (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              disabled={blocked}
              className={`flex w-full items-center justify-between border-b border-border/45 px-4 py-3 text-left transition-all ${
                isSelected
                  ? 'bg-brand-cyan/[0.04] border-l-2 border-l-brand-cyan'
                  : 'border-l-2 border-l-transparent hover:bg-bg-elevated/15'
              } ${blocked ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {/* Asset Identifiers */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <span className="font-display text-xs font-semibold text-fg">
                    {symbol}
                  </span>
                  {blocked && <Lock size={9} className="text-brand-amber shrink-0" />}
                </div>
                <span className="font-mono text-[8px] uppercase tracking-wider text-fg-mute">
                  {inst.assetClass}
                </span>
              </div>

              {/* Sparkline mini-graph */}
              <div className="hidden shrink-0 sm:block">
                <Sparkline
                  data={live.history}
                  color={isPositive ? 'var(--color-bull)' : 'var(--color-bear)'}
                />
              </div>

              {/* Live pricing */}
              <div className="text-right">
                <FlashPrice value={live.price} symbol={symbol} />
                <div
                  className={`font-mono text-[10px] font-medium leading-none ${
                    isPositive ? 'text-bull' : 'text-bear'
                  }`}
                >
                  {fmt.pct(change)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
