'use client';

import React from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Activity, Bell, Shield, Circle, Sparkles, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { fmt } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar() {
  const { data: session } = useSession();
  const {
    equity,
    balance,
    dayPnl,
    riskSettings,
    toggleUltraSafeMode,
    notifications,
    showNotificationsDrawer,
    setShowNotificationsDrawer,
    markNotificationsAsRead,
  } = useTradeStore();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isUSM = riskSettings.ultraSafeMode;

  const handleToggleDrawer = () => {
    if (!showNotificationsDrawer) {
      markNotificationsAsRead();
    }
    setShowNotificationsDrawer(!showNotificationsDrawer);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-bg/70 px-6 py-3.5 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-bull shadow-[0_0_18px_rgba(0,212,255,0.4)]">
          <Activity size={16} className="text-bg" strokeWidth={3} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display text-sm font-bold tracking-tight text-fg">
            Vector<span className="text-brand-cyan">.</span>
          </span>
          <span className="font-mono text-[7px] tracking-[0.18em] text-fg-mute uppercase">
            Algo Terminal
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="flex items-center gap-6">
        {/* Market Status */}
        <div className="hidden items-center gap-2 rounded-lg border border-bull/20 bg-bull/5 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-bull md:flex">
          <Circle size={6} fill="currentColor" className="animate-pulse" />
          <span>MARKET ACTIVE</span>
        </div>

        {/* Paper balance */}
        <div className="text-right">
          <div className="font-mono text-[8px] tracking-[0.1em] text-fg-mute uppercase">
            Paper Equity
          </div>
          <div className="tabular font-mono text-sm font-bold text-fg">
            {fmt.money(equity)}
          </div>
        </div>

        {/* Daily P&L */}
        <div className="text-right">
          <div className="font-mono text-[8px] tracking-[0.1em] text-fg-mute uppercase">
            Today's P&L
          </div>
          <div
            className={`tabular font-mono text-sm font-bold ${
              dayPnl >= 0 ? 'text-bull' : 'text-bear'
            }`}
          >
            {fmt.pct((dayPnl / 100000) * 100)}
          </div>
        </div>

        {/* Ultra Safe Toggle */}
        <button
          onClick={toggleUltraSafeMode}
          className={`relative flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-300 ${
            isUSM
              ? 'border-brand-cyan/50 bg-gradient-to-br from-brand-cyan/10 to-bull/5 shadow-[0_0_18px_rgba(0,212,255,0.2),inset_0_0_8px_rgba(0,212,255,0.05)]'
              : 'border-border bg-bg-elevated/20 hover:bg-bg-elevated/40'
          }`}
        >
          <div
            className={`relative h-3.5 w-7 rounded-full transition-colors ${
              isUSM ? 'bg-brand-cyan' : 'bg-fg-mute/45'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-0.5 h-2.5 w-2.5 rounded-full flex items-center justify-center ${
                isUSM ? 'left-[16px] bg-bg' : 'left-[2px] bg-fg'
              }`}
            >
              <Shield size={6} className={isUSM ? 'text-brand-cyan' : 'text-bg'} />
            </motion.div>
          </div>
          <div className="text-left leading-none">
            <div
              className={`font-display text-[10px] font-bold ${
                isUSM ? 'text-brand-cyan' : 'text-fg'
              }`}
            >
              Ultra Safe
            </div>
            <div className="font-mono text-[6px] tracking-wide text-fg-mute uppercase">
              {isUSM ? 'Locked' : 'Off'}
            </div>
          </div>
        </button>

        {/* Notification Bell */}
        <button
          onClick={handleToggleDrawer}
          className="relative rounded-lg border border-border bg-bg-elevated/10 p-2 text-fg-dim transition-colors hover:bg-bg-elevated/35 hover:text-fg"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-bear font-mono text-[9px] font-bold text-fg">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Session & Logout */}
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-violet to-brand-cyan font-display text-xs font-bold text-bg">
            {(session?.user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-fg-dim transition-colors hover:text-bear"
            title="Log out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
