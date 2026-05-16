'use client';

import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Business } from '@/lib/business-types';
import {
  computeCallsByDay,
  computeIntentCounts,
  computeKpis,
  computeNeedsAttention,
  maskPhone,
} from '@/lib/call-stats';
import { useCalls } from '../hooks/useCalls';
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconBarChart,
  IconCalendar,
  IconCheckCircle,
  IconFrown,
  IconMeh,
  IconMoreHorizontal,
  IconPhone,
  IconSettings,
  IconSmile,
  IconUsers,
} from '../icons';

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  useEffect(() => { mv.set(value); }, [mv, value]);
  return <motion.span>{display}</motion.span>;
}

// ─── Premium Stat Card ───────────────────────────────────────────────────────

const ICON_GRADIENTS: Record<string, string> = {
  blue: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
  purple: 'linear-gradient(135deg, #582CFF 0%, #BD00FF 100%)',
  pink: 'linear-gradient(135deg, #FF0080 0%, #FF8C00 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  orange: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  cyan: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
};

function StatCard({
  label, value, suffix, prefix, delta, deltaPositive = true, icon, color, delay,
}: {
  label: string; value: number; suffix?: string; prefix?: string;
  delta?: string; deltaPositive?: boolean; icon: React.ReactNode; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium p-5"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-white leading-tight">
            <AnimatedNumber value={value} suffix={suffix ?? ''} prefix={prefix ?? ''} />
            {delta && (
              <span className="ml-2 text-xs font-bold" style={{ color: deltaPositive ? '#01B574' : '#f5576c' }}>
                {delta}
              </span>
            )}
          </p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: ICON_GRADIENTS[color] || ICON_GRADIENTS.blue,
            boxShadow: `0 8px 20px ${color === 'blue' ? 'rgba(79,172,254,0.3)' : color === 'purple' ? 'rgba(88,44,255,0.3)' : color === 'pink' ? 'rgba(255,0,128,0.3)' : color === 'green' ? 'rgba(67,233,123,0.3)' : color === 'orange' ? 'rgba(246,211,101,0.3)' : 'rgba(0,201,255,0.3)'}`,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero Welcome Card ───────────────────────────────────────────────────────

function HeroCard({ businessName, twilioPhone }: { businessName: string; twilioPhone?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden lg:col-span-2 rounded-3xl"
      style={{
        minHeight: 340,
        background:
          'linear-gradient(135deg, rgba(6, 11, 40, 0.94) 0%, rgba(10, 14, 35, 0.85) 60%, rgba(6, 11, 40, 0.6) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Jellyfish photographic background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-jellyfish.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          opacity: 0.95,
        }}
      />

      {/* Gradient overlay — left side dark for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(6, 11, 40, 0.95) 0%, rgba(6, 11, 40, 0.65) 35%, rgba(6, 11, 40, 0.15) 70%, rgba(6, 11, 40, 0) 100%)',
        }}
      />

      {/* Subtle bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(6, 11, 40, 0.7) 100%)',
        }}
      />

      {/* Floating glow accent (mimics bioluminescence pulse) */}
      <motion.div
        className="pointer-events-none absolute"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          right: '18%',
          top: '20%',
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(79,172,254,0.35) 0%, transparent 65%)',
          filter: 'blur(30px)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-8">
        <div>
          <p className="mb-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Welcome back,
          </p>
          <h1
            className="mb-4 text-4xl font-bold tracking-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            {businessName}
          </h1>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Glad to see you again!
            <br />
            Your AI voice agent is{' '}
            <span className="font-semibold text-white">live and listening</span>.
          </p>
          {twilioPhone && (
            <p className="mt-3 font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {twilioPhone}
            </p>
          )}
        </div>

        <a
          href="/agent"
          className="mt-6 flex items-center gap-2 self-start text-sm font-semibold text-white transition-all hover:gap-3"
        >
          <span>Tap to record</span>
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <IconArrowRight className="h-3.5 w-3.5" />
          </span>
        </a>
      </div>
    </motion.div>
  );
}

// ─── Satisfaction Rate (Half-circle gauge) ───────────────────────────────────

function SatisfactionGauge({ pct }: { pct: number }) {
  // Half-circle arc: cx=100, cy=100, r=72, from left to right along the top
  const r = 72;
  const circ = Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="card-premium flex flex-col p-5"
    >
      <p className="text-base font-bold text-white">Satisfaction Rate</p>
      <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>From all calls</p>

      {/* Gauge — fully self-contained in SVG, no negative margins */}
      <div className="mt-4 flex flex-col items-center">
        {/* viewBox: 200 wide, 120 tall — arc fits with room for stroke */}
        <svg width="100%" viewBox="0 0 200 115" style={{ maxWidth: '200px', overflow: 'visible' }}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#582CFF" />
              <stop offset="50%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d="M 28 104 A 72 72 0 0 1 172 104"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <motion.path
            d="M 28 104 A 72 72 0 0 1 172 104"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
          />

          {/* Smiley badge — centered inside the half-circle bowl at (100, 72) */}
          <circle cx="100" cy="72" r="18"
            fill="url(#gaugeGrad)"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(79,172,254,0.6))' }}
          />
          <circle cx="94" cy="69" r="1.8" fill="white" />
          <circle cx="106" cy="69" r="1.8" fill="white" />
          <path d="M 94 76 Q 100 81 106 76" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>

        {/* Stat row below gauge — clean, no overlap */}
        <div
          className="mt-3 flex w-full items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>0%</span>
          <div className="text-center">
            <p className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{pct}%</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Based on calls</p>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>100%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Referral / Returning Tracker ────────────────────────────────────────────

function ReferralCard({ unique, returning }: { unique: number; returning: number }) {
  const total = unique || 1;
  const score = Math.min(10, Math.round((returning / total) * 10 * 10) / 10);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6 }}
      className="card-premium p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-base font-bold text-white mb-0.5">Caller Tracking</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Unique vs returning</p>
        </div>
        <button style={{ color: 'rgba(255,255,255,0.4)' }}>
          <IconMoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Stats column */}
        <div className="space-y-2.5">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Invited</p>
            <p className="text-2xl font-bold text-white leading-tight"><AnimatedNumber value={unique} /></p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>callers</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Returning</p>
            <p className="text-2xl font-bold text-white leading-tight"><AnimatedNumber value={returning} /></p>
          </div>
        </div>

        {/* Ring with label overlaid using absolute positioning */}
        <div className="relative flex items-center justify-center" style={{ width: '100px', height: '100px' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="refGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#43e97b" />
                <stop offset="100%" stopColor="#38f9d7" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <motion.circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke="url(#refGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - dash }}
              transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          {/* Label centered over ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Safety</p>
            <p className="text-lg font-bold text-white leading-none">{score}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Total Score</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  unit = 'calls',
  accent = '#4facfe',
}: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
  unit?: string;
  accent?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: 'rgba(13,20,64,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: `0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px ${accent}33`,
      }}
    >
      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: accent }}>
        {payload[0].value} <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{unit}</span>
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardView({ business }: { business: Business }) {
  const { calls, loading, error } = useCalls(business.id);
  const kpis = useMemo(() => computeKpis(calls), [calls]);
  const callsByDay = useMemo(() => computeCallsByDay(calls, 7), [calls]);
  const intentCounts = useMemo(() => computeIntentCounts(calls, 6), [calls]);
  const needsAttention = useMemo(() => computeNeedsAttention(calls).slice(0, 4), [calls]);

  return (
    <div className="text-white">

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(245,87,68,0.1)', border: '1px solid rgba(245,87,68,0.3)', color: '#f5576c' }}
        >
          {error}
        </motion.div>
      )}

      {/* Top KPI row — 4 cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard
          label="Total Calls"
          value={loading ? 0 : kpis.totalCalls}
          delta={kpis.totalCalls > 0 ? '+5%' : undefined}
          color="blue"
          delay={0}
          icon={<IconPhone className="h-5 w-5 text-white" />}
        />
        <StatCard
          label="Calls Today"
          value={loading ? 0 : kpis.callsToday}
          delta={kpis.callsToday > 0 ? '+3%' : undefined}
          color="purple"
          delay={0.05}
          icon={<IconCalendar className="h-5 w-5 text-white" />}
        />
        <StatCard
          label="Escalations"
          value={loading ? 0 : kpis.escalatedCount}
          delta={kpis.escalatedCount > 0 ? `${kpis.escalatedPercent}%` : undefined}
          deltaPositive={false}
          color="pink"
          delay={0.1}
          icon={<IconAlert className="h-5 w-5 text-white" />}
        />
        <StatCard
          label="Positive Sentiment"
          value={loading ? 0 : kpis.positivePercent}
          suffix="%"
          delta={kpis.positivePercent >= 50 ? '+5%' : undefined}
          color="green"
          delay={0.15}
          icon={<IconSmile className="h-5 w-5 text-white" />}
        />
      </div>

      {/* Hero + Satisfaction + Referral */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 mb-4">
        <HeroCard businessName={business.name} twilioPhone={business.twilio_phone_number} />
        <SatisfactionGauge pct={loading ? 0 : kpis.positivePercent} />
        <ReferralCard unique={loading ? 0 : kpis.uniqueCallers} returning={loading ? 0 : kpis.returningCallers} />
      </div>

      {/* Call Volume + Intents Bar Chart */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-4">

        {/* Call Volume Area Chart — Sales Overview style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background:
              'linear-gradient(127deg, rgba(6, 11, 40, 0.94) 28.26%, rgba(10, 14, 35, 0.49) 91.2%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Cyan ambient glow */}
          <div
            className="pointer-events-none absolute"
            style={{
              right: '-15%',
              top: '-30%',
              width: '60%',
              height: '120%',
              background:
                'radial-gradient(circle, rgba(1, 181, 226, 0.18) 0%, rgba(1, 181, 226, 0.08) 35%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div
            className="pointer-events-none absolute"
            style={{
              left: '-10%',
              bottom: '-30%',
              width: '50%',
              height: '90%',
              background:
                'radial-gradient(circle, rgba(0, 117, 255, 0.14) 0%, transparent 65%)',
              filter: 'blur(20px)',
            }}
          />

          <div className="relative mb-5 flex items-start justify-between">
            <div>
              <p className="text-base font-bold text-white">Call Volume</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className="font-bold" style={{ color: '#01B574' }}>
                  {kpis.totalCalls > 0 ? '+5%' : '0%'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  more in last 7 days
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={callsByDay} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
                <defs>
                  {/* Primary cyan area — vivid, glowing */}
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#21D4FD" stopOpacity={0.85} />
                    <stop offset="50%" stopColor="#21D4FD" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#21D4FD" stopOpacity={0} />
                  </linearGradient>
                  {/* Secondary lighter cyan area */}
                  <linearGradient id="callGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A6FFCB" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#A6FFCB" stopOpacity={0} />
                  </linearGradient>
                  {/* Bright cyan strokes */}
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#21D4FD" />
                    <stop offset="100%" stopColor="#7CF7FF" />
                  </linearGradient>
                  <linearGradient id="strokeGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7CF7FF" />
                    <stop offset="100%" stopColor="#21D4FD" />
                  </linearGradient>
                  {/* Glow filter for the strokes */}
                  <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255,255,255,0.07)"
                  vertical={false}
                />

                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  dy={6}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                />

                <Tooltip
                  content={<ChartTooltip accent="#21D4FD" unit="calls" />}
                  cursor={{ stroke: 'rgba(33,212,253,0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />

                {/* Back layer — total calls (vivid cyan) */}
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Total calls"
                  stroke="url(#strokeGrad)"
                  strokeWidth={3.5}
                  fill="url(#callGrad)"
                  dot={false}
                  activeDot={{
                    fill: '#fff',
                    r: 5,
                    stroke: '#21D4FD',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 0 8px rgba(33,212,253,0.9))',
                  }}
                  isAnimationActive
                  animationDuration={1500}
                  filter="url(#lineGlow)"
                />

                {/* Front layer — positive resolutions (lighter cyan-mint) */}
                <Area
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke="url(#strokeGrad2)"
                  strokeWidth={3}
                  fill="url(#callGrad2)"
                  dot={false}
                  activeDot={{
                    fill: '#fff',
                    r: 4,
                    stroke: '#7CF7FF',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 0 6px rgba(124,247,255,0.9))',
                  }}
                  isAnimationActive
                  animationDuration={1700}
                  filter="url(#lineGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Active Calls — Vision UI Active Users-style card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="card-premium relative overflow-hidden"
        >
          {/* Dark inner chart panel */}
          <div
            className="rounded-2xl mx-3 mt-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 4px 4px' }}
          >
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={callsByDay}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                barCategoryGap="40%"
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0.25} />
                  </linearGradient>
                </defs>

                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={30}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltip accent="#fff" unit="calls" />}
                />

                <Bar
                  dataKey="count"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                  style={{ filter: 'drop-shadow(0 -2px 8px rgba(255,255,255,0.2))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Header below chart */}
          <div className="px-5 pt-4 pb-2">
            <p className="text-base font-bold text-white">Active Calls</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs">
              <span className="font-bold" style={{ color: '#01B574' }}>
                (+{kpis.totalCalls})
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>than last week</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

          {/* Mini-stats row */}
          <div className="grid grid-cols-4 gap-3 px-5 py-4">
            {[
              { label: 'Callers',  value: kpis.uniqueCallers.toLocaleString(), Icon: IconUsers       },
              { label: 'Calls',    value: kpis.totalCalls.toLocaleString(),    Icon: IconPhone       },
              { label: 'Resolved', value: `${kpis.positivePercent}%`,          Icon: IconCheckCircle },
              { label: 'Intents',  value: intentCounts.length.toString(),      Icon: IconBarChart    },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.4 }}
                className="flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex shrink-0 items-center justify-center rounded-lg"
                    style={{
                      width: '30px', height: '30px',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
                      boxShadow: '0 4px 10px rgba(79,172,254,0.35)',
                    }}
                  >
                    <s.Icon className="text-white" style={{ width: '14px', height: '14px', strokeWidth: 2.5 }} />
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {s.label}
                  </span>
                </div>
                <p className="text-xl font-bold tracking-tight text-white leading-none">{s.value}</p>
                <div className="h-0.5 w-full rounded-full" style={{ background: 'linear-gradient(90deg, #4facfe 0%, rgba(79,172,254,0.2) 100%)' }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sentiment + Needs Attention */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">

        {/* Sentiment breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="card-premium p-6"
        >
          <p className="text-base font-bold text-white mb-1">Sentiment Breakdown</p>
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{kpis.totalCalls} calls analysed</p>

          {kpis.totalCalls === 0 ? (
            <p className="mt-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No data yet</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Positive', pct: kpis.positivePercent, gradient: 'linear-gradient(90deg, #43e97b, #38f9d7)', color: '#43e97b', Icon: IconSmile },
                { label: 'Neutral', pct: kpis.neutralPercent, gradient: 'linear-gradient(90deg, #a18cd1, #fbc2eb)', color: '#a18cd1', Icon: IconMeh },
                { label: 'Negative', pct: kpis.negativePercent, gradient: 'linear-gradient(90deg, #f5576c, #f093fb)', color: '#f5576c', Icon: IconFrown },
              ].map((s, i) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${s.color}1a`, border: `1px solid ${s.color}33` }}>
                        <s.Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                      </span>
                      <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{s.label}</span>
                    </div>
                    <span className="font-bold text-white">{s.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.gradient }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="card-premium p-6 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(246,211,101,0.3), transparent 70%)', filter: 'blur(20px)' }} />

          <div className="relative">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #f6d365, #fda085)', boxShadow: '0 6px 16px rgba(246,211,101,0.4)' }}>
                <IconAlert className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Needs Attention</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Escalated or negative</p>
              </div>
              {needsAttention.length > 0 && (
                <span className="ml-auto rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'rgba(246,211,101,0.2)', color: '#f6d365' }}>
                  {needsAttention.length}
                </span>
              )}
            </div>

            {needsAttention.length === 0 ? (
              <div className="relative flex flex-col items-center justify-center gap-2 py-10">
                {/* Glowing orb backdrop */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage: 'url(/empty-state-orb.png)',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(67,233,123,0.25), rgba(56,249,215,0.12))', border: '1px solid rgba(67,233,123,0.35)', backdropFilter: 'blur(8px)' }}>
                  <IconCheckCircle className="h-7 w-7" style={{ color: '#43e97b' }} />
                </div>
                <p className="relative text-sm font-bold" style={{ color: '#43e97b' }}>All clear</p>
                <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>No escalations or negative calls</p>
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
                      className="flex items-start gap-3 rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full" style={{ background: call.escalated ? '#f6d365' : '#f5576c', boxShadow: `0 0 8px ${call.escalated ? '#f6d365' : '#f5576c'}` }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{maskPhone(call.phone_number)}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={call.escalated
                              ? { background: 'rgba(246,211,101,0.15)', color: '#f6d365' }
                              : { background: 'rgba(245,87,108,0.15)', color: '#f5576c' }}
                          >
                            {call.escalated ? 'escalated' : 'negative'}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {call.transcript?.slice(0, 80) ?? '—'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
