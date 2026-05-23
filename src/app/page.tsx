import Link from 'next/link';
import {
  Activity,
  Shield,
  Brain,
  BarChart3,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-bull shadow-[0_0_18px_rgba(0,212,255,0.4)]">
            <Activity size={16} className="text-bg" strokeWidth={3} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              Vector<span className="text-brand-cyan">.</span>
            </span>
            <span className="font-mono text-[8px] tracking-[0.15em] text-fg-mute">
              ALGO TERMINAL
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-7 text-sm text-fg-dim md:flex">
          <a href="#features" className="transition-colors hover:text-fg">
            Features
          </a>
          <a href="#safe-mode" className="transition-colors hover:text-fg">
            Ultra Safe Mode
          </a>
          <a href="#pricing" className="transition-colors hover:text-fg">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-1.5 text-sm text-fg-dim transition-colors hover:text-fg"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-cyan to-bull px-3.5 py-1.5 text-sm font-medium text-bg shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-transform hover:scale-[1.02]"
          >
            Launch terminal
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-12 md:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-panel/50 px-3 py-1 backdrop-blur">
          <Sparkles size={11} className="text-brand-violet" />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
            AI Copilot · Paper Trading · Backtesting
          </span>
        </div>

        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Trade like an{' '}
          <span className="bg-gradient-to-r from-brand-cyan via-bull to-brand-cyan bg-clip-text text-transparent">
            institution
          </span>
          .
          <br />
          Risk like one too.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-dim">
          An algorithmic trading terminal built around capital preservation.
          Real-time charts, strategy builder, backtesting engine, and an AI
          copilot that flags when you're about to do something dumb.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-cyan to-bull px-5 py-3 font-medium text-bg shadow-[0_0_30px_rgba(0,212,255,0.35)] transition-transform hover:scale-[1.02]"
          >
            Launch the terminal
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border-strong bg-bg-panel/50 px-5 py-3 font-medium text-fg backdrop-blur transition-colors hover:bg-bg-elevated"
          >
            Create account
          </Link>
          <span className="ml-2 font-mono text-xs text-fg-mute">
            Free · Paper trading only · No card required
          </span>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-12"
      >
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-mute">
            What's inside
          </div>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need.{' '}
            <span className="text-fg-dim">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* Ultra Safe Mode spotlight */}
      <section
        id="safe-mode"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-12"
      >
        <div className="panel relative p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)',
            }}
          />
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1">
                <Shield size={12} className="text-brand-cyan" />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-cyan">
                  Signature feature
                </span>
              </div>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Ultra Safe Mode
              </h3>
              <p className="mt-3 text-fg-dim md:text-lg">
                One toggle. Six rules. Built for traders who'd rather miss a
                rally than blow up an account. Caps risk at 1% per trade,
                filters out volatile assets, enforces cooldowns after losses,
                and auto-reduces exposure during drawdowns.
              </p>
              <p className="mt-3 text-sm text-fg-mute">
                No trading system can guarantee zero loss. Ultra Safe Mode
                minimizes risk and preserves capital — slow returns are the
                point.
              </p>
            </div>

            <ul className="space-y-2">
              {SAFE_RULES.map((r) => (
                <li
                  key={r}
                  className="flex items-center gap-3 rounded-lg border border-brand-cyan/15 bg-brand-cyan/[0.06] px-3.5 py-2.5"
                >
                  <Lock size={12} className="shrink-0 text-brand-cyan" />
                  <span className="text-sm">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-xs text-fg-mute">
          <span>Vector Algo Terminal · v0.1.0</span>
          <span>
            Paper trading only · Not financial advice · Built for learning
          </span>
        </div>
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Real-time charts',
    desc: 'Candlestick charts with SMA, EMA, RSI, MACD, Bollinger Bands, Supertrend, VWAP, and Fibonacci. Multiple timeframes, drawing tools, crosshair.',
    accent: 'cyan' as const,
  },
  {
    icon: Zap,
    title: 'Paper trading engine',
    desc: 'Practice with simulated capital. Market, limit, and stop orders. Stop-loss, take-profit, and trailing stops. Slippage and fees modeled in.',
    accent: 'bull' as const,
  },
  {
    icon: Layers,
    title: 'Strategy builder',
    desc: "No-code block-based builder. Combine indicator conditions, define risk rules, and backtest before going live — all without writing code.",
    accent: 'violet' as const,
  },
  {
    icon: Brain,
    title: 'AI copilot',
    desc: 'Streaming AI assistant that explains indicators, reviews your trades, flags revenge trading, and suggests improvements in plain English.',
    accent: 'violet' as const,
  },
  {
    icon: TrendingUp,
    title: 'Backtesting',
    desc: 'Replay historical candles at adjustable speed. See equity curve, Sharpe ratio, drawdown, win rate, and trade-by-trade logs.',
    accent: 'amber' as const,
  },
  {
    icon: Shield,
    title: 'Risk-first by design',
    desc: 'Dedicated Risk Center with exposure analysis, behavioral flags, position-sizing calculator, and daily loss limits enforced server-side.',
    accent: 'cyan' as const,
  },
];

const SAFE_RULES = [
  'Max 1% capital risk per trade',
  'Volatile assets filtered out automatically',
  'Daily loss limit · 2% hard stop',
  'Cooldown after 2 consecutive losses',
  'Multi-confirmation entry rules',
  'Auto-reduce exposure on drawdown',
];

import type { LucideIcon } from 'lucide-react';

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: 'cyan' | 'bull' | 'amber' | 'violet';
}) {
  const accentClass = {
    cyan: 'bg-brand-cyan/10 text-brand-cyan',
    bull: 'bg-bull/10 text-bull',
    amber: 'bg-brand-amber/10 text-brand-amber',
    violet: 'bg-brand-violet/10 text-brand-violet',
  }[accent];

  return (
    <div className="panel group relative p-5 transition-colors hover:border-border-strong">
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${accentClass}`}
      >
        <Icon size={16} />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-dim">{desc}</p>
    </div>
  );
}
