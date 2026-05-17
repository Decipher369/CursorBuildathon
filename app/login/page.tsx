'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
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

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSuccess('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-200';
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };
  const inputFocusStyle = {
    borderColor: 'rgba(79,172,254,0.6)',
    boxShadow: '0 0 0 3px rgba(79,172,254,0.15)',
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d0b2a 0%, #060b28 50%, #0a0e23 100%)' }}
    >
      {/* Animated orbs */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%', left: '-5%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(94,84,215,0.5), transparent 70%)',
          animation: 'orb-float-1 18s ease-in-out infinite',
          filter: 'blur(1px)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-15%', right: '-10%', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(0,212,255,0.35), transparent 70%)',
          animation: 'orb-float-2 22s ease-in-out infinite',
          filter: 'blur(1px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md px-4"
      >
        {/* Logo + brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
              boxShadow: '0 12px 32px rgba(79,172,254,0.45)',
            }}
          >
            CS
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              CallSense
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              AI Voice Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Tab switcher */}
          <div
            className="mb-7 grid grid-cols-2 gap-1 rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className="rounded-lg py-2 text-xs font-bold uppercase tracking-widest transition-all"
                style={
                  mode === m
                    ? {
                        background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(79,172,254,0.35)',
                      }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(245,87,108,0.12)',
                  border: '1px solid rgba(245,87,108,0.3)',
                  color: '#f5576c',
                }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(67,233,123,0.12)',
                  border: '1px solid rgba(67,233,123,0.3)',
                  color: '#43e97b',
                }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo credentials hint */}
          <div
            className="mb-5 rounded-xl px-4 py-3"
            style={{
              background: 'rgba(79,172,254,0.08)',
              border: '1px solid rgba(79,172,254,0.2)',
            }}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(79,172,254,0.7)' }}>
              Demo credentials
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Email: <span className="font-mono text-white">kshagash@gmail.com</span>
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Password: <span className="font-mono text-white">123456</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Email
              </label>
              <input
                type="email"
                required
                className={inputCls}
                style={inputStyle}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className={inputCls}
                style={inputStyle}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full rounded-xl py-3 text-sm font-bold tracking-wide text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)',
                boxShadow: '0 8px 24px rgba(79,172,254,0.4)',
              }}
            >
              {loading
                ? mode === 'signin'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {mode === 'signin'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="font-semibold underline underline-offset-2"
              style={{ color: 'rgba(79,172,254,0.9)' }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          CallSense · AI Voice Receptionist for SEA Businesses
        </p>
      </motion.div>

      <style jsx global>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.04); }
          66% { transform: translate(25px, -20px) scale(0.98); }
        }
      `}</style>
    </div>
  );
}
