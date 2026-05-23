'use client';

import React from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Briefcase, Activity, AlertTriangle, FileText } from 'lucide-react';
import { fmt } from '@/lib/format';

export default function PositionsTable() {
  const { positions, livePrices, closePosition, tradeHistory } = useTradeStore();

  return (
    <div className="space-y-4">
      {/* Open Positions Card */}
      <div className="panel">
        <div className="border-b border-border px-4 py-3">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute">
            Open Positions ({positions.length})
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase size={22} className="text-fg-mute opacity-40 mb-3" />
            <span className="font-display text-sm text-fg-dim">No open positions</span>
            <span className="font-mono text-[10px] text-fg-mute mt-1">Place an order to initiate trades</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-border font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Side</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Entry</th>
                  <th className="px-4 py-3">Mark</th>
                  <th className="px-4 py-3">Target / Stop</th>
                  <th className="px-4 py-3 text-right">Unrealized P&L</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {positions.map((pos) => {
                  const live = livePrices[pos.symbol];
                  const markPrice = live?.price || pos.entryPrice;
                  const pnl = pos.unrealizedPnl;
                  const pnlPct = (pnl / (pos.entryPrice * pos.qty)) * 100;

                  return (
                    <tr key={pos.id} className="hover:bg-bg-elevated/10">
                      <td className="px-4 py-3.5 font-display font-semibold text-fg">
                        {pos.symbol}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono text-[10px] font-bold uppercase ${
                            pos.side === 'buy' ? 'text-bull' : 'text-bear'
                          }`}
                        >
                          {pos.side === 'buy' ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-fg">{pos.qty}</td>
                      <td className="px-4 py-3.5 font-mono text-fg-dim">
                        {fmt.price(pos.entryPrice)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-fg">
                        {fmt.price(markPrice)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10.5px] text-fg-mute">
                        <span className="text-bull/80">{pos.takeProfit ? `TP: ${pos.takeProfit}` : '—'}</span>
                        <span className="mx-1">/</span>
                        <span className="text-bear/80">{pos.stopLoss ? `SL: ${pos.stopLoss}` : '—'}</span>
                      </td>
                      <td
                        className={`px-4 py-3.5 text-right font-mono font-medium ${
                          pnl >= 0 ? 'text-bull' : 'text-bear'
                        }`}
                      >
                        {fmt.money(pnl)} ({fmt.pct(pnlPct)})
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="rounded border border-bear/35 bg-bear/10 px-2.5 py-1 font-mono text-[10px] font-bold text-bear transition-all hover:bg-bear hover:text-fg"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade History Card */}
      <div className="panel">
        <div className="border-b border-border px-4 py-3">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute">
            Closed Trade Logs
          </span>
        </div>

        {tradeHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText size={20} className="text-fg-mute opacity-40 mb-2.5" />
            <span className="font-display text-sm text-fg-dim">No historical records</span>
            <span className="font-mono text-[10px] text-fg-mute mt-1">Closed transactions populate here</span>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-border font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Side</th>
                  <th className="px-4 py-3">Filled Qty</th>
                  <th className="px-4 py-3">Close Price</th>
                  <th className="px-4 py-3 text-right">Realized Return</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {tradeHistory.map((trade) => {
                  const pnl = trade.pnl ?? 0;
                  return (
                    <tr key={trade.id} className="hover:bg-bg-elevated/10">
                      <td className="px-4 py-3 font-display font-semibold text-fg">
                        {trade.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-[10px] font-bold uppercase ${
                            trade.side === 'buy' ? 'text-bear' : 'text-bull'
                          }`}
                        >
                          {trade.side === 'buy' ? 'CLOSE' : 'CLOSE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-fg-dim">{trade.qty}</td>
                      <td className="px-4 py-3 font-mono text-fg-dim">
                        {fmt.price(trade.price)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-medium ${
                          pnl >= 0 ? 'text-bull' : 'text-bear'
                        }`}
                      >
                        {fmt.money(pnl)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[10px] text-fg-mute">
                        {new Date(trade.ts).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
