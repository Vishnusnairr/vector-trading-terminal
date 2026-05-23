'use client';

import React from 'react';
import { useTradeStore } from '@/store/useTradeStore';
import { Bell, X, ShieldAlert, CheckCircle2, TrendingDown, Clock, Info } from 'lucide-react';
import { fmt } from '@/lib/format';
import { motion } from 'framer-motion';

export default function NotificationsList() {
  const { notifications, showNotificationsDrawer, setShowNotificationsDrawer } = useTradeStore();

  if (!showNotificationsDrawer) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-border bg-bg-panel/95 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-brand-cyan" />
          <span className="font-display text-sm font-bold text-fg">
            Terminal Alert Logs
          </span>
        </div>
        <button
          onClick={() => setShowNotificationsDrawer(false)}
          className="text-fg-mute transition-colors hover:text-fg"
        >
          <X size={16} />
        </button>
      </div>

      {/* Notifications Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center font-mono text-xs text-fg-mute gap-2">
            <Bell size={20} className="opacity-30" />
            <span>No alerts logged yet</span>
          </div>
        ) : (
          notifications.map((notif) => {
            let Icon = Info;
            let colorClass = 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20';

            if (notif.type === 'trade_filled') {
              Icon = CheckCircle2;
              colorClass = 'text-bull bg-bull/10 border-bull/20';
            } else if (notif.type === 'stop_loss_hit' || notif.type === 'risk_alert') {
              Icon = ShieldAlert;
              colorClass = 'text-bear bg-bear/10 border-bear/20';
            } else if (notif.type === 'take_profit_hit') {
              Icon = CheckCircle2;
              colorClass = 'text-bull bg-bull/10 border-bull/20';
            }

            return (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={notif.id}
                className={`flex items-start gap-3 rounded-lg border p-3.5 leading-relaxed text-xs ${colorClass}`}
              >
                <div className="mt-0.5 shrink-0">
                  <Icon size={14} />
                </div>
                <div className="space-y-1">
                  <div className="font-display font-semibold text-fg">
                    {notif.title}
                  </div>
                  <div className="font-sans text-[11px] text-fg-dim">
                    {notif.body}
                  </div>
                  <div className="font-mono text-[8px] text-fg-mute">
                    {fmt.ago(notif.createdAt)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
