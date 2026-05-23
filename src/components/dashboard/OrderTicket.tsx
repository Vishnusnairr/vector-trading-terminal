'use client';

import React, { useState, useEffect } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { AlertTriangle, Lock, ShieldCheck, DollarSign } from 'lucide-react';
import { fmt } from '@/lib/format';

interface OrderTicketProps {
  symbol: string;
  price: number;
}

export default function OrderTicket({ symbol, price }: OrderTicketProps) {
  const {
    balance,
    equity,
    riskSettings,
    placeOrder,
    instruments,
    consecutiveLosses,
  } = useTradeStore();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [qty, setQty] = useState<string>('0.1');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const inst = instruments.find((i) => i.symbol === symbol);

  useEffect(() => {
    setLimitPrice(price.toFixed(2));
    setStopPrice((price * 1.01).toFixed(2));
    setFeedback(null);
  }, [symbol, price]);

  if (!inst) return null;

  const currentPrice = orderType === 'market' ? price : parseFloat(limitPrice) || price;
  const numQty = parseFloat(qty) || 0;
  const notional = numQty * currentPrice;

  // Ultra Safe Mode validations (client-side matching)
  const isUSM = riskSettings.ultraSafeMode;
  const isVolatileBlocked = isUSM && inst.risky;
  
  // Calculate capital risk (using Stop Loss distance or default 2% risk)
  const slVal = parseFloat(stopLoss);
  const slPct = slVal ? Math.abs((currentPrice - slVal) / currentPrice) : 0.02;
  const capitalRisk = notional * slPct;
  const maxRisk = equity * riskSettings.maxRiskPerTrade;
  const isRiskSizeBlocked = isUSM && capitalRisk > maxRisk;

  // Cooldown check
  const isCooldownBlocked = isUSM && consecutiveLosses >= riskSettings.maxConsecutiveLosses;

  const isBlocked = isVolatileBlocked || isRiskSizeBlocked || isCooldownBlocked || notional <= 0;

  const handleQuickPercent = (pct: number) => {
    const size = (balance * pct) / currentPrice;
    setQty(size.toFixed(inst.minQty < 1 ? 4 : 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const orderQty = parseFloat(qty);
    if (!orderQty || orderQty <= 0) {
      setFeedback({ type: 'error', msg: 'Enter a valid quantity' });
      return;
    }

    const orderParams = {
      symbol,
      side,
      type: orderType,
      qty: orderQty,
      price: orderType === 'market' ? undefined : parseFloat(limitPrice),
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    };

    const res = placeOrder(orderParams);

    if (res.success) {
      setFeedback({ type: 'success', msg: `Order processed successfully!` });
      setStopLoss('');
      setTakeProfit('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', msg: res.reason || 'Order execution rejected.' });
    }
  };

  return (
    <div className="panel flex flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-2">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute">
          Order Ticket
        </span>
        {isUSM ? (
          <span className="flex items-center gap-1 font-mono text-[9px] text-brand-cyan">
            <ShieldCheck size={11} />
            USM GUARD ACTIVE
          </span>
        ) : (
          <span className="font-mono text-[9px] text-fg-mute uppercase">Paper Mode</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4">
        {/* BUY / SELL Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg-elevated/35 p-1 border border-border">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`rounded-md py-2 font-display text-xs font-semibold uppercase tracking-wider transition-all ${
              side === 'buy'
                ? 'bg-bull text-bg shadow-[0_0_12px_rgba(0,229,168,0.25)]'
                : 'text-fg-dim hover:text-fg'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`rounded-md py-2 font-display text-xs font-semibold uppercase tracking-wider transition-all ${
              side === 'sell'
                ? 'bg-bear text-fg shadow-[0_0_12px_rgba(255,84,112,0.25)]'
                : 'text-fg-dim hover:text-fg'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Types */}
        <div className="grid grid-cols-3 gap-1.5">
          {(['market', 'limit', 'stop'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setOrderType(t)}
              className={`rounded-lg border py-1.5 font-mono text-[9.5px] uppercase tracking-wider transition-colors ${
                orderType === t
                  ? 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan'
                  : 'border-border bg-bg-elevated/10 text-fg-dim hover:bg-bg-elevated/25 hover:text-fg'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Main Inputs */}
        <div className="space-y-2.5">
          {/* Quantity field */}
          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-fg-mute">
              <span>Quantity</span>
              <span>Min Qty: {inst.minQty}</span>
            </div>
            <div className="relative flex items-center rounded-lg border border-border bg-bg-elevated/20 px-3 py-1.5">
              <input
                type="number"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-fg outline-none"
              />
              <span className="font-mono text-[9.5px] text-fg-mute uppercase">{symbol.substr(0, 3)}</span>
            </div>
          </div>

          {/* Limit Price */}
          {orderType === 'limit' && (
            <div>
              <div className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                Limit Price (USD)
              </div>
              <div className="relative flex items-center rounded-lg border border-border bg-bg-elevated/20 px-3 py-1.5">
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs text-fg outline-none"
                />
                <span className="font-mono text-[9.5px] text-fg-mute">USD</span>
              </div>
            </div>
          )}

          {/* Stop Trigger Price */}
          {orderType === 'stop' && (
            <div>
              <div className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-fg-mute">
                Stop Trigger Price (USD)
              </div>
              <div className="relative flex items-center rounded-lg border border-border bg-bg-elevated/20 px-3 py-1.5">
                <input
                  type="number"
                  step="any"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs text-fg outline-none"
                />
                <span className="font-mono text-[9.5px] text-fg-mute">USD</span>
              </div>
            </div>
          )}

          {/* Protective bracket stops */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-fg-mute">Stop Loss</span>
              <div className="flex items-center rounded-lg border border-border bg-bg-elevated/20 px-3 py-1.5">
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-transparent font-mono text-xs text-fg outline-none placeholder:text-fg-mute/60"
                />
              </div>
            </div>
            <div>
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-fg-mute">Take Profit</span>
              <div className="flex items-center rounded-lg border border-border bg-bg-elevated/20 px-3 py-1.5">
                <input
                  type="number"
                  step="any"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-transparent font-mono text-xs text-fg outline-none placeholder:text-fg-mute/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Position Size quick selectors */}
        <div className="grid grid-cols-4 gap-1">
          {[0.1, 0.25, 0.5, 1].map((pct) => (
            <button
              type="button"
              key={pct}
              onClick={() => handleQuickPercent(pct)}
              className="rounded bg-bg-elevated/20 border border-border/80 py-1 font-mono text-[9px] text-fg-dim transition-colors hover:bg-bg-elevated/50 hover:text-fg"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Trade cost review panel */}
        <div className="rounded-lg border border-border/70 bg-bg-elevated/10 p-2.5 space-y-1 text-xs">
          <div className="flex justify-between font-mono text-[10px] text-fg-dim">
            <span>Est. Size</span>
            <span className="text-fg">{fmt.money(notional)}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-fg-dim">
            <span>Fees (0.1%)</span>
            <span className="text-fg">{fmt.money(notional * 0.001)}</span>
          </div>
          {isUSM && (
            <div className="flex justify-between font-mono text-[10px] text-brand-cyan/85">
              <span>Risk Sizing Cap</span>
              <span>{fmt.money(maxRisk)}</span>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div
            className={`rounded-lg border p-2.5 text-center text-xs ${
              feedback.type === 'success'
                ? 'border-bull/20 bg-bull/5 text-bull'
                : 'border-bear/20 bg-bear/5 text-bear'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Ultra Safe warning panels */}
        {isVolatileBlocked && (
          <div className="flex items-start gap-2 rounded-lg border border-brand-amber/35 bg-brand-amber/5 p-2.5 text-[11px] text-brand-amber leading-normal">
            <Lock size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong>Blocked by Ultra Safe Mode.</strong> {symbol} is flagged as a high-volatility asset. Disable USM to open.
            </span>
          </div>
        )}

        {isUSM && !isVolatileBlocked && isRiskSizeBlocked && (
          <div className="flex items-start gap-2 rounded-lg border border-bear/35 bg-bear/5 p-2.5 text-[11px] text-bear leading-normal">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong>Position sizing rejected.</strong> Capital risk of $
              {capitalRisk.toFixed(2)} exceeds your 1% cap ($
              {maxRisk.toFixed(2)}). Reduce Qty.
            </span>
          </div>
        )}

        {isCooldownBlocked && (
          <div className="flex items-start gap-2 rounded-lg border border-bear/35 bg-bear/5 p-2.5 text-[11px] text-bear leading-normal">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong>Trading Cooldown Active.</strong> Restricting trades after {consecutiveLosses} consecutive losses to prevent emotional churn.
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBlocked}
          className={`w-full rounded-lg py-2.5 font-display text-sm font-semibold uppercase tracking-wider transition-all active:scale-[0.99] ${
            isBlocked
              ? 'bg-bg-elevated border border-border text-fg-mute cursor-not-allowed'
              : side === 'buy'
              ? 'bg-gradient-to-br from-bull to-emerald-400 text-bg shadow-[0_0_20px_rgba(0,229,168,0.25)] hover:scale-[1.01]'
              : 'bg-gradient-to-br from-bear to-rose-400 text-fg shadow-[0_0_20px_rgba(255,84,112,0.25)] hover:scale-[1.01]'
          }`}
        >
          {isVolatileBlocked ? 'Blocked' : isBlocked ? 'Rejected' : `${side} ${symbol}`}
        </button>
      </form>
    </div>
  );
}
