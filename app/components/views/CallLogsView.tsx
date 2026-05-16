'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { Business } from '@/lib/business-types';
import type { CallRow } from '@/lib/call-stats';
import { callSummary, formatDuration, maskPhone } from '@/lib/call-stats';
import { useCalls } from '../hooks/useCalls';

function SentimentBadge({ label }: { label?: string }) {
  const n = label ?? 'neutral';
  const cls =
    n === 'positive'
      ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/20'
      : n === 'negative'
        ? 'bg-red-500/20 text-red-400 ring-red-500/20'
        : 'bg-amber-500/20 text-amber-400 ring-amber-500/20';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1 ${cls}`}>
      {n}
    </span>
  );
}

function IntentBadge({ intent }: { intent?: string }) {
  return (
    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400 ring-1 ring-blue-500/20 capitalize">
      {intent ?? 'unknown'}
    </span>
  );
}

function CallDetailPanel({ call, onClose }: { call: CallRow; onClose: () => void }) {
  return (
    <motion.aside
      key="detail"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l border-white/[0.06] bg-slate-900/95 backdrop-blur-xl lg:relative lg:inset-auto lg:z-auto lg:w-96 lg:shrink-0"
    >
      <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <p className="font-mono text-sm font-semibold text-white">
            {maskPhone(call.phone_number)}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(call.created_at).toLocaleString('en-SG')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <div className="flex flex-wrap gap-2">
          <SentimentBadge label={call.sentiment_label} />
          <IntentBadge intent={call.intent} />
          {call.escalated && (
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/20">
              Escalated
            </span>
          )}
          {call.duration_seconds != null && call.duration_seconds > 0 && (
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-slate-400">
              {formatDuration(call.duration_seconds)}
            </span>
          )}
        </div>

        {call.sentiment_score != null && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Sentiment score</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((call.sentiment_score + 1) * 50)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] text-slate-600">
              {call.sentiment_score.toFixed(2)}
            </p>
          </div>
        )}

        {call.transcript && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Caller</p>
            <div className="rounded-xl rounded-bl-sm bg-white/[0.06] p-3 text-sm text-slate-300 leading-relaxed">
              {call.transcript}
            </div>
          </div>
        )}

        {call.agent_response && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Agent</p>
            <div className="rounded-xl rounded-br-sm bg-teal-500/20 p-3 text-sm text-teal-200 leading-relaxed ring-1 ring-teal-500/20">
              {call.agent_response}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export default function CallLogsView({ business }: { business: Business }) {
  const { calls, loading, error } = useCalls(business.id);
  const [selected, setSelected] = useState<CallRow | null>(null);

  const sorted = [...calls].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="flex min-h-full bg-slate-950">
      <div className={`flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-8 ${selected ? 'lg:pr-0' : ''}`}>
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Call Logs</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {loading ? 'Loading…' : `${sorted.length} calls recorded`}
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors lg:hidden"
            >
              ← Back
            </button>
          )}
        </motion.header>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Desktop table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm sm:block"
        >
          {sorted.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <span className="text-4xl opacity-30">📋</span>
              <p className="text-sm text-slate-600">No calls yet. Run a simulation from the Dashboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Caller</th>
                    <th className="px-5 py-3.5 font-medium">Duration</th>
                    <th className="px-5 py-3.5 font-medium">Sentiment</th>
                    <th className="px-5 py-3.5 font-medium">Intent</th>
                    <th className="px-5 py-3.5 font-medium">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((call, i) => (
                    <motion.tr
                      key={call.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      onClick={() => setSelected(call.id === selected?.id ? null : call)}
                      className={`cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.04] ${
                        selected?.id === call.id ? 'bg-teal-500/5' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-400">
                        {new Date(call.created_at).toLocaleString('en-SG')}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                        {maskPhone(call.phone_number)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {formatDuration(call.duration_seconds)}
                      </td>
                      <td className="px-5 py-3.5">
                        <SentimentBadge label={call.sentiment_label} />
                      </td>
                      <td className="px-5 py-3.5">
                        <IntentBadge intent={call.intent} />
                      </td>
                      <td className="max-w-xs truncate px-5 py-3.5 text-slate-500">
                        {callSummary(call)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Mobile cards */}
        <div className="space-y-3 sm:hidden">
          {sorted.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <span className="text-4xl opacity-30">📋</span>
              <p className="text-sm text-slate-600">No calls yet.</p>
            </div>
          ) : (
            sorted.map((call, i) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                onClick={() => setSelected(call.id === selected?.id ? null : call)}
                className={`cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 transition-colors ${
                  selected?.id === call.id ? 'ring-1 ring-teal-500/40' : ''
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-300">{maskPhone(call.phone_number)}</span>
                  <span className="text-xs text-slate-600">
                    {new Date(call.created_at).toLocaleString('en-SG')}
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <SentimentBadge label={call.sentiment_label} />
                  <IntentBadge intent={call.intent} />
                  {call.escalated && (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                      Escalated
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500">{callSummary(call)}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <CallDetailPanel
            key={selected.id}
            call={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
