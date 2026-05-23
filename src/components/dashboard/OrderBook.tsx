'use client';

import React, { useMemo } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { fmt } from '@/lib/format';

interface OrderBookProps {
  price: number;
}

export default function OrderBook({ price }: OrderBookProps) {
  const book = useMemo(() => {
    const bids = [];
    const asks = [];
    
    // Seed bids & asks based on current ticks price
    for (let i = 0; i < 8; i++) {
      const bidPrice = price * (1 - (i + 1) * 0.00025);
      const askPrice = price * (1 + (i + 1) * 0.00025);
      
      const bidSize = 0.15 + Math.sin(i * 1.5 + price) * 0.1 + Math.random() * 2.8;
      const askSize = 0.15 + Math.cos(i * 1.5 + price) * 0.1 + Math.random() * 2.8;
      
      bids.push({ price: bidPrice, size: Math.max(0.01, bidSize) });
      asks.push({ price: askPrice, size: Math.max(0.01, askSize) });
    }
    
    return { bids, asks: asks.reverse() };
  }, [price]);

  const maxCumulativeSize = useMemo(() => {
    const cumulativeBids = book.bids.reduce((acc, curr) => acc + curr.size, 0);
    const cumulativeAsks = book.asks.reduce((acc, curr) => acc + curr.size, 0);
    return Math.max(cumulativeBids, cumulativeAsks) || 1;
  }, [book]);

  return (
    <div className="panel flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute">
          Order Book
        </span>
        <span className="font-mono text-[9px] text-fg-mute">
          Spread: {fmt.price(price * 0.0005, 4)}
        </span>
      </div>

      {/* Grid Header */}
      <div className="mb-1.5 grid grid-cols-3 font-mono text-[9px] uppercase tracking-wider text-fg-mute text-right">
        <span className="text-left">Price (USD)</span>
        <span>Size</span>
        <span>Total</span>
      </div>

      {/* Asks (Sells) */}
      <div className="flex flex-col gap-0.5 mb-1.5">
        {book.asks.map((ask, i) => {
          const cumulative = book.asks.slice(i).reduce((s, x) => s + x.size, 0);
          const widthPct = (cumulative / maxCumulativeSize) * 100;
          return (
            <div key={'a' + i} className="relative flex items-center justify-between py-0.5 text-right font-mono text-[10.5px]">
              {/* Histogram bar background */}
              <div
                className="absolute right-0 bottom-0 top-0 bg-bear/10 opacity-70 transition-all duration-300"
                style={{ width: `${Math.min(100, widthPct)}%` }}
              />
              <span className="text-left font-semibold text-bear z-10">{fmt.price(ask.price)}</span>
              <span className="text-fg z-10">{ask.size.toFixed(3)}</span>
              <span className="text-fg-dim/70 z-10">{cumulative.toFixed(3)}</span>
            </div>
          );
        })}
      </div>

      {/* Spread ticker bar */}
      <div className="flex items-center justify-between border-y border-border bg-bg-elevated/20 py-1.5 px-1 mb-1.5">
        <span className="font-mono text-xs font-bold text-fg tabular">
          {fmt.price(price)}
        </span>
        <span className="font-mono text-[9px] text-fg-mute">
          Tick spread · 0.03%
        </span>
      </div>

      {/* Bids (Buys) */}
      <div className="flex flex-col gap-0.5">
        {book.bids.map((bid, i) => {
          const cumulative = book.bids.slice(0, i + 1).reduce((s, x) => s + x.size, 0);
          const widthPct = (cumulative / maxCumulativeSize) * 100;
          return (
            <div key={'b' + i} className="relative flex items-center justify-between py-0.5 text-right font-mono text-[10.5px]">
              {/* Histogram bar background */}
              <div
                className="absolute right-0 bottom-0 top-0 bg-bull/10 opacity-70 transition-all duration-300"
                style={{ width: `${Math.min(100, widthPct)}%` }}
              />
              <span className="text-left font-semibold text-bull z-10">{fmt.price(bid.price)}</span>
              <span className="text-fg z-10">{bid.size.toFixed(3)}</span>
              <span className="text-fg-dim/70 z-10">{cumulative.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
