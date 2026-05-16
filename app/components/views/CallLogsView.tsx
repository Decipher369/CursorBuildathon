'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Business } from '@/lib/business-types';
import type { CallRow } from '@/lib/call-stats';
import {
  callSummary,
  formatDuration,
  maskPhone,
} from '@/lib/call-stats';
import CallAudioListenButton from '../CallAudioListenButton';
import { useCalls } from '../hooks/useCalls';
import { IconCallLogs, IconPhone } from '../icons';

function SentimentBadge({ label }: { label?: string }) {
  const normalized = label ?? 'neutral';
  const style: React.CSSProperties =
    normalized === 'positive'
      ? { background: 'rgba(67,233,123,0.15)', color: '#43e97b', border: '1px solid rgba(67,233,123,0.3)' }
      : normalized === 'negative'
        ? { background: 'rgba(245,87,108,0.15)', color: '#f5576c', border: '1px solid rgba(245,87,108,0.3)' }
        : { background: 'rgba(246,211,101,0.15)', color: '#f6d365', border: '1px solid rgba(246,211,101,0.3)' };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
      style={style}
    >
      {normalized}
    </span>
  );
}

export default function CallLogsView({ business }: { business: Business }) {
  const { calls, loading, error } = useCalls(business.id);
  const [selected, setSelected] = useState<CallRow | null>(null);

  const sorted = [...calls].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // ESC closes the side panel
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <div className="flex min-h-full px-2 pt-6 pb-8 text-white">
      <div className={`flex-1 transition-all ${selected ? 'pr-4' : ''}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card-premium relative mb-6 flex items-center gap-4 overflow-hidden p-6"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(67,233,123,0.15) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              boxShadow: '0 8px 24px rgba(67,233,123,0.35)',
            }}
          >
            <IconCallLogs className="h-6 w-6 text-white" />
          </div>
          <div className="relative">
            <h1 className="text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Call Logs
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {loading ? 'Loading…' : `${sorted.length} ${sorted.length === 1 ? 'call' : 'calls'}`}
            </p>
          </div>
        </motion.div>

        {error && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(245,87,108,0.12)',
              border: '1px solid rgba(245,87,108,0.3)',
              color: '#f5576c',
            }}
          >
            {error}
          </div>
        )}

        {/* Table card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="card-premium overflow-hidden"
        >
          {sorted.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <IconPhone className="h-6 w-6" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <p className="text-sm font-semibold text-white">No calls yet</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Run a simulation from the Test Agent page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {['Date', 'Caller', 'Duration', 'Sentiment', 'Summary', 'Audio'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((call, i) => {
                    const isActive = selected?.id === call.id;
                    return (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.02 * i, duration: 0.3 }}
                        onClick={() => setSelected(call)}
                        className="cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isActive ? 'rgba(79,172,254,0.08)' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {new Date(call.created_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-white">
                          {maskPhone(call.phone_number)}
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {formatDuration(call.duration_seconds)}
                        </td>
                        <td className="px-5 py-3.5">
                          <SentimentBadge label={call.sentiment_label} />
                        </td>
                        <td className="max-w-xs truncate px-5 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {callSummary(call)}
                        </td>
                        <td className="px-5 py-3.5">
                          <CallAudioListenButton audio_base64={call.audio_base64} />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      </div>

      {/* Detail side panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key={selected.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-6 w-full max-w-md shrink-0 self-start overflow-hidden rounded-3xl"
            style={{
              background:
                'linear-gradient(127deg, rgba(6, 11, 40, 0.94) 28%, rgba(10, 14, 35, 0.7) 91%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              maxHeight: 'calc(100vh - 6rem)',
              overflowY: 'auto',
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between px-6 py-4 backdrop-blur-md"
              style={{
                background: 'rgba(6,11,40,0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div>
                <p className="font-mono text-sm text-white">
                  {maskPhone(selected.phone_number)}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                aria-label="Close panel"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex flex-wrap gap-2">
                <SentimentBadge label={selected.sentiment_label} />
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    background: 'rgba(79,172,254,0.15)',
                    color: '#4facfe',
                    border: '1px solid rgba(79,172,254,0.3)',
                  }}
                >
                  {selected.intent ?? 'unknown'}
                </span>
                {selected.escalated && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: 'rgba(246,211,101,0.18)',
                      color: '#f6d365',
                      border: '1px solid rgba(246,211,101,0.3)',
                    }}
                  >
                    Escalated
                  </span>
                )}
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Caller
                </p>
                <div
                  className="rounded-2xl rounded-bl-sm p-3.5 text-sm leading-relaxed"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {selected.transcript || '—'}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Agent
                </p>
                <div
                  className="rounded-2xl rounded-br-sm p-3.5 text-sm leading-relaxed text-white"
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
                    boxShadow: '0 8px 24px rgba(79,172,254,0.35)',
                  }}
                >
                  {selected.agent_response || '—'}
                </div>
                <div className="mt-3">
                  <CallAudioListenButton audio_base64={selected.audio_base64} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Duration
                </p>
                <p className="text-sm font-semibold text-white">
                  {formatDuration(selected.duration_seconds)}
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
