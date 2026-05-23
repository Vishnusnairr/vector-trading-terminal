'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowLeft, CheckCircle2, Lock, Mail, ShieldAlert, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Decorative radial background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute left-1/2 top-1/4 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-brand-cyan/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="panel z-10 w-full max-w-[420px] p-8 md:p-10"
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-bull shadow-[0_0_20px_rgba(0,212,255,0.35)]">
            <Activity size={20} className="text-bg" strokeWidth={3} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Create Vector account
          </h1>
          <p className="mt-1.5 text-xs text-fg-dim">
            Fund your paper account and design strategies instantly
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-bear/30 bg-bear/10 p-3 text-xs text-bear"
          >
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <CheckCircle2 size={40} className="text-bull" />
            <h2 className="mt-4 font-display text-lg font-semibold text-fg">
              Registration Successful!
            </h2>
            <p className="mt-1 text-xs text-fg-dim">
              Your institutional paper trading balance has been loaded.
              Redirecting you to login...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-fg-mute">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-fg-mute" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-bg-elevated/40 py-2.5 pl-10 pr-4 font-sans text-sm text-fg outline-none transition-all placeholder:text-fg-mute focus:border-brand-cyan/50 focus:bg-bg-elevated/80"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-fg-mute">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-fg-mute" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@vector.io"
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-bg-elevated/40 py-2.5 pl-10 pr-4 font-sans text-sm text-fg outline-none transition-all placeholder:text-fg-mute focus:border-brand-cyan/50 focus:bg-bg-elevated/80"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-fg-mute">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-fg-mute" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-bg-elevated/40 py-2.5 pl-10 pr-4 font-sans text-sm text-fg outline-none transition-all placeholder:text-fg-mute focus:border-brand-cyan/50 focus:bg-bg-elevated/80"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-bull py-2.5 text-sm font-semibold text-bg shadow-[0_0_24px_rgba(0,212,255,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? 'Registering...' : 'Register paper account'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-fg-dim">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-cyan hover:underline">
            Login here
          </Link>
        </div>

        <div className="mt-6 flex justify-center gap-2 border-t border-border pt-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-dim transition-colors hover:bg-bg-elevated/60 hover:text-fg"
          >
            <ArrowLeft size={11} />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
