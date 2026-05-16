'use client';

import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Business } from '@/lib/business-types';
import {
  computeCallsByDay,
  computeIntentCounts,
  computeKpis,
  computeNeedsAttention,
  maskPhone,
} from '@/lib/call-stats';
import { useCalls } from '../hooks/useCalls';

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => { mv.set(value); }, [mv, value]);
  return <motion.span>{display}</motion.span>;
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  suffix,
  delta,
  icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta?: string;
  icon: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {delta && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            {delta}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-white">
        <AnimatedNumber value={value} suffix={suffix ?? ''} />
      </p>
      <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
    </motion.div>
  );
}

// ─── Sentiment arc ───────────────────────────────────────────────────────────

function SentimentArc({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          transform="rotate(-90 44 44)"
        />
        <text x="44" y="49" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
          {pct}%
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

// ─── Live pulse dot ──────────────────────────────────────────────────────────

function PulseDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"
          animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-teal-400' : 'bg-slate-600'}`}
      />
    </span>
  );
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs backdrop-blur-md">
      <p className="font-medium text-slate-300">{label}</p>
      <p className="font-bold text-teal-400">{payload[0].value} calls</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardView({ business }: { business: Business }) {
  const { calls, loading, error } = useCalls(business.id);
  const kpis = useMemo(() => computeKpis(calls), [calls]);
  const callsByDay = useMemo(() => computeCallsByDay(calls, 7), [calls]);
  const intentCounts = useMemo(() => computeIntentCounts(calls, 5), [calls]);
  const needsAttention = useMemo(() => computeNeedsAttention(calls).slice(0, 4), [calls]);

  const maxIntent = intentCounts[0]?.count || 1;

  return (
    <div className="min-h-full bg-slate-950 p-6 text-slate-100">
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {business.name}
            </h1>
            <PulseDot active={!loading} />
          </div>
          <p className="mt-0.5 text-sm text-slate-400">
            AI Voice Agent Dashboard
            {business.twilio_phone_number && (
              <span className="ml-2 font-mono text-slate-500">· {business.twilio_phone_number}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2">
          <PulseDot active />
          <span className="text-xs font-medium text-teal-400">Live</span>
          <span className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.header>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* ── KPI Grid ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Calls" value={loading ? 0 : kpis.totalCalls} icon="📞" color="#14b8a6" delay={0} />
        <StatCard label="Calls Today" value={loading ? 0 : kpis.callsToday} icon="🗓️" color="#8b5cf6" delay={0.05} />
        <StatCard label="Escalations" value={loading ? 0 : kpis.escalatedCount} icon="⚠️" color="#f59e0b" delta={kpis.escalatedCount > 0 ? `${kpis.escalatedPercent}%` : undefined} delay={0.1} />
        <StatCard label="Positive Sentiment" value={loading ? 0 : kpis.positivePercent} suffix="%" icon="😊" color="#10b981" delay={0.15} />
        <StatCard label="Unique Callers" value={loading ? 0 : kpis.uniqueCallers} icon="👥" color="#3b82f6" delay={0.2} />
        <StatCard label="Returning" value={loading ? 0 : kpis.returningCallers} icon="🔁" color="#ec4899" delta={kpis.uniqueCallers > 0 ? `${Math.round((kpis.returningCallers / kpis.uniqueCallers) * 100) || 0}%` : undefined} delay={0.25} />
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        {/* Call Volume */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Call Volume</h2>
              <p className="text-xs text-slate-400">Last 7 days</p>
            </div>
            <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
              {kpis.totalCalls} total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={callsByDay} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#callGrad)"
                dot={{ fill: '#14b8a6', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#fff', r: 5, stroke: '#14b8a6', strokeWidth: 2 }}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Arcs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <div className="mb-4">
            <h2 className="font-semibold text-white">Sentiment Split</h2>
            <p className="text-xs text-slate-400">{kpis.totalCalls} calls analysed</p>
          </div>
          {kpis.totalCalls === 0 ? (
            <p className="mt-8 text-center text-xs text-slate-600">No data yet</p>
          ) : (
            <div className="flex items-center justify-around">
              <SentimentArc pct={kpis.positivePercent} color="#10b981" label="Positive" />
              <SentimentArc pct={kpis.neutralPercent} color="#71717a" label="Neutral" />
              <SentimentArc pct={kpis.negativePercent} color="#ef4444" label="Negative" />
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Intents + Needs Attention ── */}
      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        {/* Intent Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <div className="mb-4">
            <h2 className="font-semibold text-white">Top Intents</h2>
            <p className="text-xs text-slate-400">What callers want</p>
          </div>
          {intentCounts.length === 0 ? (
            <p className="mt-6 text-center text-xs text-slate-600">No data yet</p>
          ) : (
            <div className="space-y-3">
              {intentCounts.map((ic, i) => (
                <div key={ic.intent}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="capitalize text-slate-300">{ic.intent}</span>
                    <span className="font-medium text-slate-400">{ic.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `hsl(${174 - i * 18}, 70%, 50%)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(ic.count / maxIntent) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <div>
              <h2 className="font-semibold text-white">Needs Attention</h2>
              <p className="text-xs text-slate-400">Escalated or negative calls</p>
            </div>
            {needsAttention.length > 0 && (
              <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                {needsAttention.length}
              </span>
            )}
          </div>
          {needsAttention.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <span className="text-3xl">✅</span>
              <p className="text-sm font-medium text-emerald-400">All clear</p>
              <p className="text-xs text-slate-500">No escalations or negative sentiment</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {needsAttention.map((call, i) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-3"
                  >
                    <span className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${call.escalated ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{maskPhone(call.phone_number)}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${call.escalated ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                          {call.escalated ? 'escalated' : 'negative'}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {call.transcript?.slice(0, 70) ?? '—'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
