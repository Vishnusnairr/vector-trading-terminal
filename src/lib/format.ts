/**
 * Vector formatters
 * Centralized so every price, P&L, and percentage looks identical everywhere.
 * All functions are null-safe and return '—' for missing values.
 */

const nf = (digits: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const fmt = {
  /** Plain price: 67,234.50 */
  price(n: number | null | undefined, digits = 2): string {
    if (n == null || !Number.isFinite(n)) return '—';
    return nf(digits).format(n);
  },

  /** Money with $ sign and negative handling: -$1,234.56 */
  money(n: number | null | undefined, digits = 2): string {
    if (n == null || !Number.isFinite(n)) return '—';
    const sign = n < 0 ? '-' : '';
    return `${sign}$${nf(digits).format(Math.abs(n))}`;
  },

  /** Percent with explicit sign and locked decimals: +2.34% */
  pct(n: number | null | undefined, digits = 2): string {
    if (n == null || !Number.isFinite(n)) return '—';
    return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
  },

  /** Compact for volume: 1.24M, 56.7K */
  compact(n: number | null | undefined): string {
    if (n == null || !Number.isFinite(n)) return '—';
    const a = Math.abs(n);
    if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(0);
  },

  /** Short relative time: "2m ago", "now" */
  ago(date: Date | string | number): string {
    const ms = Date.now() - new Date(date).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 5) return 'now';
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  },

  /** HH:MM clock */
  time(date: Date | string | number): string {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  },
};

/** Returns the color token name for a P&L value */
export function pnlTone(n: number | null | undefined): 'bull' | 'bear' | 'neutral' {
  if (n == null || n === 0) return 'neutral';
  return n > 0 ? 'bull' : 'bear';
}
