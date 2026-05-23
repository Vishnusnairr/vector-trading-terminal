'use client';

import React from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Home, BarChart3, Layers, Clock, Shield, Brain, Briefcase, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Terminal',   icon: Home,       desc: 'Live trading terminal' },
  { id: 'markets',    label: 'Markets',    icon: BarChart3,  desc: 'Market watchlist universe' },
  { id: 'strategies', label: 'Strategies', icon: Layers,     desc: 'No-code strategy architect' },
  { id: 'backtest',   label: 'Backtests',  icon: Clock,      desc: 'Historical replay simulations' },
  { id: 'risk',       label: 'Risk Center',icon: Shield,     desc: 'Capital risk audit dashboard' },
  { id: 'ai',         label: 'AI Copilot',  icon: Brain,      desc: 'Contextual trade intelligence' },
  { id: 'positions',  label: 'Positions',  icon: Briefcase,  desc: 'Open trade log tracking' },
  { id: 'settings',   label: 'Settings',   icon: Settings,   desc: 'Configure terminal accounts' },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useTradeStore();

  return (
    <nav className="flex w-18 flex-col gap-1 border-r border-border bg-bg/40 px-2 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.desc}
            className={`group relative flex flex-col items-center gap-1.5 rounded-xl py-3 text-center transition-all ${
              isActive
                ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/25'
                : 'text-fg-dim border border-transparent hover:bg-bg-elevated/25 hover:text-fg'
            }`}
          >
            {/* Active Left Indicator */}
            {isActive && (
              <span className="absolute -left-[1px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded bg-brand-cyan shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
            )}
            <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-display text-[9px] font-medium tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
