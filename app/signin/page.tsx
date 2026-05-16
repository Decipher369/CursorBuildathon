'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = getSupabaseBrowser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: '#080c10' }}
    >
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
          style={{
            width: 700,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(0,200,150,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            width: 400,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(88,44,255,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black"
              style={{ background: '#00C896', color: '#080c10' }}
            >
              CS
            </span>
            <span className="text-xl font-bold tracking-tight text-white">CallSense</span>
          </Link>
          <p className="text-sm text-slate-500">AI voice agent for SEA businesses</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Tab switcher */}
          <div
            className="mb-6 flex rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: 'rgba(255,255,255,0.08)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="mb-1 text-xl font-bold text-white">
                {mode === 'signin' ? 'Welcome back' : 'Get started free'}
              </h1>
              <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {mode === 'signin'
                  ? 'Sign in to your CallSense dashboard'
                  : 'Create your account to deploy your AI agent'}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-400"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@business.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-teal-500/60 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-teal-500/60 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: loading
                  ? 'rgba(0,200,150,0.3)'
                  : 'linear-gradient(135deg, #00C896 0%, #00a87e 100%)',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(0,200,150,0.3)',
                color: '#080c10',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                  />
                  {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : mode === 'signin' ? (
                'Sign In →'
              ) : (
                'Create Account →'
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            By continuing you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-white/60 transition-colors">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-2 hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <Link href="/" className="hover:text-white/60 transition-colors">
            ← Back to homepage
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
