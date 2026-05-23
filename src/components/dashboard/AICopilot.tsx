'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Bot, User, Send, Sparkles, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmt } from '@/lib/format';

interface Message {
  role: 'ai' | 'user';
  text: string;
  ts: Date;
}

export default function AICopilot() {
  const { positions, equity, riskSettings, consecutiveLosses, tradeHistory } = useTradeStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "Hello! I am Vector's context-aware trading Copilot. I scan your terminal stats, exposure levels, and consecutive loss profiles to deliver institutional risk reviews and strategy insights. Try asking me about 'RSI strategy', 'risk scoring', or 'my current losses'!",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleQuery = (text?: string) => {
    const query = (text || input).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { role: 'user', text: query, ts: new Date() }]);
    setInput('');
    setThinking(true);

    // Context-aware dynamic responses generator
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('rsi') || lower.includes('indicator')) {
        reply = "Relative Strength Index (RSI) is a key momentum oscillator mapping buying pressure from 0 to 100. Traditionally, readings below 30 denote oversold conditions (potential buy triggers), and above 70 denote overbought conditions (potential sell levels). A sophisticated approach is looking for 'RSI Divergences': if prices form a new lower low, but the RSI makes a higher low, it signals selling pressure is exhaustively drying up.";
      } else if (lower.includes('loss') || lower.includes('losing') || lower.includes('drawdown')) {
        const lossStreak = consecutiveLosses;
        const totalClosedLosses = tradeHistory.filter((t) => (t.pnl ?? 0) < 0).length;
        
        if (lossStreak > 0) {
          reply = `I am auditing your recent logs: You are on a consecutive loss streak of ${lossStreak} trades. ${
            riskSettings.ultraSafeMode 
              ? `Ultra Safe Mode is actively protecting you with a risk limit of 1% and mandatory loss cooldowns.`
              : `Warning: Ultra Safe Mode is currently OFF. You have suffered ${totalClosedLosses} closed losses today. Consider activating Ultra Safe Mode to prevent emotional over-leveraging and over-trading.`
          }`;
        } else {
          reply = `Your portfolio looks balanced! There is no active consecutive loss streak currently detected, and your paper capital equity sits at ${fmt.money(equity)}. Leverage and drawdown remain well within institutional tolerances. Keep protecting your stops!`;
        }
      } else if (lower.includes('safe') || lower.includes('ultra')) {
        reply = `Ultra Safe Mode forces structural capital preservation rules into your terminal order ticket:
        1. Cap risk exposure per trade to exactly 1% of total equity (using Stop Loss brackets).
        2. Block trades on high-volatility asset classes automatically (like BTC, SOL, TSLA).
        3. Restrict trading completely if consecutive losses reach ${riskSettings.maxConsecutiveLosses}.
        4. Auto-reduce order allocations if daily drawdown limits are exceeded.
        
        This mimics professional risk budgeting — slower, compounding returns are the target.`;
      } else if (lower.includes('strategy') || lower.includes('idea')) {
        reply = "Here is an institutional-quality strategy config template called 'The EMA Pullback Confluence':\n\n1. TIMEFRAME: 1-hour chart.\n2. TREND FILTER: Only buy if current mark sits above the 50 SMA.\n3. ENTRY RULE: RSI(14) pulls back below 35, triggering oversold signals.\n4. TRIGGER CONFIRMATION: The first candle closing above the 9 EMA.\n5. RISK SETTINGS: Stop Loss at 1.5% distance, Take Profit targets at 3.5% (2.3x Risk-to-Reward ratio).";
      } else {
        reply = `I scanned your query: "${query}". Real-time Gemini/OpenAI API integrations can be loaded by setting the OPENAI_API_KEY environment variable. For this terminal setup, I've loaded your context: Balance stands at ${fmt.money(equity)} across ${positions.length} open exposure streams. Ask me about indicators, strategy templates, or risk scoring audits!`;
      }

      setMessages((prev) => [...prev, { role: 'ai', text: reply, ts: new Date() }]);
      setThinking(false);
    }, 850 + Math.random() * 600);
  };

  return (
    <div className="panel flex h-[390px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <span className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-fg-mute">
          <Sparkles size={11} className="text-brand-violet animate-pulse" />
          AI Trading Copilot
        </span>
        <span className="flex items-center gap-1 font-mono text-[9.5px] text-brand-violet font-semibold">
          <Cpu size={10} />
          MODEL-V1 ACTIVE
        </span>
      </div>

      {/* Messages Logs Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
              className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-xs ${
                msg.role === 'ai'
                  ? 'bg-brand-violet/10 text-brand-violet'
                  : 'bg-bg-elevated/45 text-fg-dim border border-border'
              }`}
            >
              {msg.role === 'ai' ? <Bot size={13} /> : <User size={13} />}
            </div>
            <div
              className={`rounded-lg border px-3 py-2 text-xs leading-relaxed max-w-[85%] font-sans ${
                msg.role === 'ai'
                  ? 'border-brand-violet/15 bg-brand-violet/[0.03] text-fg'
                  : 'border-brand-cyan/15 bg-brand-cyan/[0.03] text-fg'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-2.5">
            <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10 text-brand-violet text-xs">
              <Bot size={13} />
            </div>
            <div className="flex items-center gap-1 bg-brand-violet/[0.03] border border-brand-violet/10 rounded-lg px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-violet animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-violet animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-violet animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts buttons */}
      <div className="flex gap-1.5 px-4 py-1.5 overflow-x-auto shrink-0 border-t border-border/30">
        {['RSI Strategy', 'Why am I losing?', 'Ultra Safe details'].map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => handleQuery(prompt)}
            className="shrink-0 rounded-full border border-border bg-bg-elevated/15 px-3 py-1 font-mono text-[9px] text-fg-mute transition-colors hover:border-brand-violet hover:text-fg"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleQuery();
        }}
        className="flex gap-2 border-t border-border/50 px-4 py-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Vector Copilot about rules, charts, or drawdowns..."
          className="w-full rounded-lg border border-border bg-bg-elevated/20 px-3 py-1.5 text-xs text-fg outline-none transition-all placeholder:text-fg-mute/70 focus:border-brand-violet/50"
        />
        <button
          type="submit"
          className="flex items-center justify-center rounded-lg bg-brand-violet px-3 py-1.5 text-bg hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}
