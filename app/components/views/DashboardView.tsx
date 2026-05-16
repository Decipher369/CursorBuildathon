'use client';

import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
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
  IconArrowRight,
  IconCart,
  IconFileDoc,
  IconFrown,
  IconGlobe,
  IconMoreHorizontal,
  IconPhone,
  IconRocket,
  IconSmile,
  IconWallet,
  IconWrench,
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

const VISION_STAT_ICON_BG = 'linear-gradient(126.97deg, #0048ff 28.26%, #21D4FD 91.2%)';
const VISION_STAT_ICON_SHADOW = '0 10px 24px rgba(0, 72, 255, 0.45)';

function StatCard({
  label, value, suffix, prefix, delta, deltaPositive = true, icon, color, delay,
}: {
  label: string; value: number; suffix?: string; prefix?: string;
  delta?: string; deltaPositive?: boolean; icon: React.ReactNode; color: string; delay: number;
}) {
  void color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="mb-2 text-sm font-medium capitalize" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {label}
          </p>
          <p className="flex flex-wrap items-baseline gap-2 leading-none">
            <span className="text-2xl font-bold tracking-tight text-white md:text-[26px]">
              <AnimatedNumber value={value} suffix={suffix ?? ''} prefix={prefix ?? ''} />
            </span>
            {delta && (
              <span className="text-sm font-bold" style={{ color: deltaPositive ? '#01B574' : '#f5576c' }}>
                {delta}
              </span>
            )}
          </p>
        </div>
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: VISION_STAT_ICON_BG,
            boxShadow: VISION_STAT_ICON_SHADOW,
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
        background: 'linear-gradient(135deg, #0a1628 0%, #132a5c 32%, #1d4ed8 58%, #2563eb 85%, #1e40af 100%)',
        backdropFilter: 'blur(22px)',
        boxShadow: '0 14px 48px rgba(15, 40, 120, 0.45)',
      }}
    >
      {/* Jellyfish photographic background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-jellyfish.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          opacity: 0.88,
        }}
      />

      {/* Gradient overlay — left side dark for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(8, 14, 36, 0.92) 0%, rgba(8, 14, 36, 0.5) 38%, rgba(29, 78, 216, 0.12) 72%, rgba(37, 99, 235, 0.08) 100%)',
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
          <p className="max-w-md text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
            Glad to see you again! Ask me anything.
          </p>
          {twilioPhone && (
            <p className="mt-3 font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {twilioPhone}
            </p>
          )}
        </div>

        <Link
          href="/agent"
          prefetch
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
        </Link>
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
      <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>From all projects</p>

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
            border: 'none',
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
          <p className="text-base font-bold text-white mb-0.5">Referral Tracking</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Unique vs returning</p>
        </div>
        <button style={{ color: 'rgba(255,255,255,0.4)' }}>
          <IconMoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Stats column */}
        <div className="space-y-2.5">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Invited</p>
            <p className="text-2xl font-bold text-white leading-tight"><AnimatedNumber value={unique} /></p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>people</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Returning</p>
            <p className="text-2xl font-bold text-white leading-tight"><AnimatedNumber value={returning} /></p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>people</p>
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
        border: 'none',
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
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Total calls"
          value={loading ? 0 : kpis.totalCalls}
          delta={kpis.totalCalls > 0 ? '+5%' : undefined}
          color="blue"
          delay={0}
          icon={<IconWallet className="h-6 w-6 text-white" />}
        />
        <StatCard
          label="Calls today"
          value={loading ? 0 : kpis.callsToday}
          delta={kpis.callsToday > 0 ? '+3%' : undefined}
          color="purple"
          delay={0.05}
          icon={<IconGlobe className="h-6 w-6 text-white" />}
        />
        <StatCard
          label="Escalations"
          value={loading ? 0 : kpis.escalatedCount}
          delta={kpis.escalatedCount > 0 ? `${kpis.escalatedPercent}%` : undefined}
          deltaPositive={false}
          color="pink"
          delay={0.1}
          icon={<IconFileDoc className="h-6 w-6 text-white" />}
        />
        <StatCard
          label="Positive sentiment"
          value={loading ? 0 : kpis.positivePercent}
          suffix="%"
          delta={kpis.positivePercent >= 50 ? '+5%' : undefined}
          color="green"
          delay={0.15}
          icon={<IconSmile className="h-6 w-6 text-white" />}
        />
      </div>

      {/* Hero + Satisfaction + Referral */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 mb-6">
        <HeroCard businessName={business.name} twilioPhone={business.twilio_phone_number} />
        <SatisfactionGauge pct={loading ? 0 : kpis.positivePercent} />
        <ReferralCard unique={loading ? 0 : kpis.uniqueCallers} returning={loading ? 0 : kpis.returningCallers} />
      </div>

      {/* Call Volume + Intents Bar Chart */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">

        {/* Call Volume Area Chart — Sales Overview style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: 'rgba(12, 16, 42, 0.82)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
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
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#21D4FD" stopOpacity={0.85} />
                    <stop offset="50%" stopColor="#21D4FD" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#21D4FD" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#21D4FD" />
                    <stop offset="100%" stopColor="#7CF7FF" />
                  </linearGradient>
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

                {/* Single series: total calls per day */}
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Calls"
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
            style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 4px 4px' }}
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
              { label: 'Callers',  value: kpis.uniqueCallers.toLocaleString(), Icon: IconWallet  },
              { label: 'Calls',    value: kpis.totalCalls.toLocaleString(),    Icon: IconRocket  },
              { label: 'Resolved', value: `${kpis.positivePercent}%`,          Icon: IconCart    },
              { label: 'Intents',  value: intentCounts.length.toString(),      Icon: IconWrench  },
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

      {/* Recent Calls table + Activity feed — Vision UI Projects/Orders style */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">

        {/* Recent Calls — Projects table style (3/5 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="card-premium p-6 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-base font-bold text-white">Recent Calls</p>
            <button style={{ color: 'rgba(255,255,255,0.4)' }}><IconMoreHorizontal className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-1.5 mb-5">
            <span className="h-2 w-2 rounded-full" style={{ background: '#43e97b', boxShadow: '0 0 6px #43e97b' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{kpis.totalCalls} calls this week</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 mb-3 px-1">
            {['CALLER', 'SENTIMENT', 'INTENT', 'RESOLUTION'].map(h => (
              <p key={h} className={`text-[10px] font-bold uppercase tracking-widest ${h === 'CALLER' ? 'col-span-4' : h === 'INTENT' ? 'col-span-3' : 'col-span-2'} ${h === 'RESOLUTION' ? 'col-span-3' : ''}`}
                style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</p>
            ))}
          </div>
          <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {calls.length === 0 ? (
            <p className="py-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No calls yet</p>
          ) : (
            <div className="space-y-1">
              {calls.slice(0, 6).map((call, i) => {
                const isPos = call.sentiment_label === 'positive';
                const isNeg = call.sentiment_label === 'negative';
                const pct = isPos ? 100 : isNeg ? 20 : 60;
                const barColor = isPos ? '#43e97b' : isNeg ? '#f5576c' : '#a18cd1';
                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    className="grid grid-cols-12 gap-2 items-center rounded-xl px-1 py-2.5"
                    style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  >
                    {/* Caller */}
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ background: `hsl(${(i * 47) % 360},60%,40%)` }}>
                        {call.phone_number?.slice(-2) ?? '??'}
                      </div>
                      <span className="truncate font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {maskPhone(call.phone_number)}
                      </span>
                    </div>
                    {/* Sentiment */}
                    <div className="col-span-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: `${barColor}22`, color: barColor }}>
                        {call.sentiment_label ?? 'n/a'}
                      </span>
                    </div>
                    {/* Intent */}
                    <div className="col-span-3">
                      <span className="truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {call.intent ?? '—'}
                      </span>
                    </div>
                    {/* Resolution bar */}
                    <div className="col-span-3">
                      <div className="mb-1 text-[11px] font-bold" style={{ color: '#fff' }}>{pct}%</div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}99)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Activity feed — Orders overview style (2/5 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="card-premium p-6 lg:col-span-2"
        >
          <p className="text-base font-bold text-white mb-1">Call Activity</p>
          <div className="flex items-center gap-1.5 mb-5">
            <span className="text-xs font-bold" style={{ color: '#43e97b' }}>+{kpis.callsToday}</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>today</span>
          </div>

          <div className="space-y-0">
            {calls.length === 0 ? (
              <p className="py-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No activity yet</p>
            ) : (
              calls.slice(0, 7).map((call, i) => {
                const isPos = call.sentiment_label === 'positive';
                const isNeg = call.sentiment_label === 'negative';
                const iconBg = isPos ? 'linear-gradient(135deg,#43e97b,#38f9d7)' : isNeg ? 'linear-gradient(135deg,#f5576c,#f093fb)' : 'linear-gradient(135deg,#4facfe,#00f2fe)';
                const Icon = isPos ? IconSmile : isNeg ? IconFrown : IconPhone;
                const ts = call.created_at ? new Date(call.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-start gap-3 py-3"
                    style={{ borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                      style={{ background: iconBg }}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {call.intent ?? maskPhone(call.phone_number)}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{ts}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
