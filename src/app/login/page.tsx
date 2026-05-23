'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowLeft, Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    // For demo purposes, mock login with the demo account if OAuth is clicked
    try {
      const res = await signIn('credentials', {
        email: 'demo@vector.io',
        password: 'demo123',
        redirect: false,
      });

      if (res?.error) {
        setError('OAuth configuration missing. Dynamic demo redirect failed.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('OAuth failure');
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
            <Activity size={20} className="text-bg animate-pulse" strokeWidth={3} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome back to Vector
          </h1>
          <p className="mt-1.5 text-xs text-fg-dim">
            Algorithmic execution and institutional risk controls
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

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-fg-mute">
                Password
              </label>
              <Link
                href="#"
                className="font-mono text-[9px] uppercase tracking-wider text-brand-cyan hover:underline"
              >
                Forgot?
              </Link>
            </div>
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
            className="relative flex w-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-bull py-2.5 text-sm font-semibold text-bg shadow-[0_0_24px_rgba(0,212,255,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign in to terminal'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-bg-panel/90 px-3 font-mono text-[9px] uppercase tracking-widest text-fg-mute">
            Or connect via
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleMockOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated/20 py-2 font-mono text-xs text-fg-dim transition-colors hover:bg-bg-elevated/50 hover:text-fg"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>
          <button
            onClick={() => handleMockOAuth('github')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated/20 py-2 font-mono text-xs text-fg-dim transition-colors hover:bg-bg-elevated/50 hover:text-fg"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            GitHub
          </button>
        </div>

        {/* Demo Quick login bypass */}
        <div className="mt-5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/[0.03] p-3 text-center">
          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cyan">
            Sandbox bypass active
          </span>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
            <Sparkles size={11} className="text-bull" />
            <button
              onClick={() => {
                setEmail('demo@vector.io');
                setPassword('demo123');
              }}
              className="font-medium text-fg underline hover:text-brand-cyan"
            >
              Autofill seeded Demo Account credentials
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 text-center text-xs text-fg-dim">
          Don't have an account?{' '}
          <Link href="/signup" className="text-brand-cyan hover:underline">
            Register here
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
