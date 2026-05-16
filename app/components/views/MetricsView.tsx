'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconBarChart,
  IconCheckCircle,
  IconFlask,
  IconPhone,
  IconRefresh,
  IconSignal,
  IconZap,
} from '../icons';

// ─── Mock Data ────────────────────────────────────────────────────────────────

type HourStat = { hour: number; requests: number; errors: number; avgMs: number };

function seedHours(base: number, errRate: number, msBase: number): HourStat[] {
  return Array.from({ length: 24 }, (_, i) => {
    const noise = 1 + (Math.sin(i * 0.7) * 0.35 + Math.sin(i * 1.3) * 0.2);
    const requests = Math.max(0, Math.round(base * noise));
    const errors = Math.round(requests * errRate * (0.5 + Math.random() * 0.5));
    const avgMs = Math.round(msBase * (0.8 + Math.random() * 0.4));
    return { hour: i, requests, errors, avgMs };
  });
}

const AGENTS = [
  {
    id: 'callsense-agent',
    name: 'callsense-agent',
    role: 'Voice Middleware',
    color: '#14b8a6',
    colorLight: 'teal',
    uptimePct: 99.7,
    hours: seedHours(18, 0.012, 47),
  },
  {
    id: 'a2a-translator',
    name: 'a2a-translator',
    role: 'Language Translation',
    color: '#8b5cf6',
    colorLight: 'violet',
    uptimePct: 99.9,
    hours: seedHours(8, 0.011, 312),
  },
  {
    id: 'a2a-compliance-checker',
    name: 'a2a-compliance-checker',
    role: 'Policy Compliance',
    color: '#f59e0b',
    colorLight: 'amber',
    uptimePct: 100,
    hours: seedHours(4, 0, 890),
  },
] as const;

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimCount({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

// ─── Uptime Ring (SVG, pure) ──────────────────────────────────────────────────

function UptimeRing({ pct, color }: { pct: number; color: string }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  const gradientId = `uptimeGrad-${color.replace('#', '')}`;
  useEffect(() => {
    const t = setTimeout(() => setDash((pct / 100) * circ), 80);
    return () => clearTimeout(t);
  }, [pct, circ]);
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor="#4facfe" stopOpacity={1} />
        </linearGradient>
        <filter id={`glow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={circ - dash}
        transform="rotate(-90 40 40)"
        filter={`url(#glow-${gradientId})`}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text
        x="40"
        y="44"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        style={{ letterSpacing: '-0.02em' }}
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── 24-hour Sparkline (pure divs) ───────────────────────────────────────────

function Sparkline({ hours, color }: { hours: HourStat[]; color: string }) {
  const max = Math.max(...hours.map((h) => h.requests), 1);
  return (
    <div className="flex h-14 items-end gap-[3px]">
      {hours.map((h) => {
        const heightPct = Math.max(6, Math.round((h.requests / max) * 100));
        return (
          <div
            key={h.hour}
            title={`${h.hour}:00 · ${h.requests} reqs`}
            className="flex-1 rounded-t-md opacity-90 hover:opacity-100"
            style={{
              height: `${heightPct}%`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}80 60%, ${color}10 100%)`,
              boxShadow: `0 -1px 8px ${color}40`,
              transition: 'height 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Stacked Success/Error Bar ────────────────────────────────────────────────

function StackBar({ success, errors }: { success: number; errors: number }) {
  const total = success + errors;
  const successPct = total === 0 ? 100 : Math.round((success / total) * 100);
  const errPct = 100 - successPct;
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(successPct), 80);
    return () => clearTimeout(t);
  }, [successPct]);
  return (
    <div className="space-y-1.5">
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-l-full"
          style={{
            width: `${w}%`,
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            boxShadow: '0 0 8px rgba(67,233,123,0.5)',
            transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
        {errPct > 0 && (
          <div
            className="h-full rounded-r-full"
            style={{
              width: `${100 - w}%`,
              background: 'linear-gradient(90deg, #f5576c 0%, #f093fb 100%)',
              boxShadow: '0 0 8px rgba(245,87,108,0.4)',
              transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px]">
        <span style={{ color: '#43e97b' }}>{success.toLocaleString()} ok</span>
        <span style={{ color: errors > 0 ? '#f5576c' : 'rgba(255,255,255,0.3)' }}>{errors} err</span>
      </div>
    </div>
  );
}

// ─── Response Time Bar ────────────────────────────────────────────────────────

function RtBar({ ms, maxMs, color }: { ms: number; maxMs: number; color: string }) {
  const pct = Math.round((ms / maxMs) * 100);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  const label = ms < 100 ? 'Fast' : ms < 500 ? 'Good' : 'Slow';
  return (
    <div className="space-y-1.5">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
            boxShadow: `0 0 8px ${color}80`,
            transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>{ms} ms avg</span>
        <span
          className="rounded-full px-2 py-0.5 font-semibold"
          style={
            ms < 100
              ? { background: 'rgba(67,233,123,0.15)', color: '#43e97b', border: '1px solid rgba(67,233,123,0.25)' }
              : ms < 500
                ? { background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.25)' }
                : { background: 'rgba(246,211,101,0.15)', color: '#f6d365', border: '1px solid rgba(246,211,101,0.25)' }
          }
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, maxMs }: { agent: typeof AGENTS[number]; maxMs: number }) {
  const totalReqs = useMemo(() => agent.hours.reduce((s, h) => s + h.requests, 0), [agent]);
  const totalErrs = useMemo(() => agent.hours.reduce((s, h) => s + h.errors, 0), [agent]);
  const avgMs = useMemo(
    () => Math.round(agent.hours.reduce((s, h) => s + h.avgMs, 0) / agent.hours.length),
    [agent],
  );
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="card-premium relative p-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: agent.color + '33', border: `1px solid ${agent.color}44` }}
          >
            {agent.name[0].toUpperCase()}
          </span>
          <div>
            <p className="font-mono text-sm font-semibold text-white">{agent.name}</p>
            <p className="text-[10px] text-slate-500">{agent.role}</p>
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{ background: agent.color + '22', color: agent.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: agent.color, boxShadow: `0 0 4px ${agent.color}` }}
          />
          Active
        </span>
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { val: totalReqs, label: 'Requests', color: '#fff', suffix: '' },
          { val: totalErrs, label: 'Errors', color: totalErrs === 0 ? '#43e97b' : '#f5576c', suffix: '' },
          { val: avgMs, label: 'Avg RT', color: '#fff', suffix: ' ms' },
        ].map(({ val, label, color, suffix }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-xl font-bold" style={{ color }}>
              <AnimCount to={val} suffix={suffix} />
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Uptime + RT + Success bar */}
      <div className="mb-5 flex items-center gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <UptimeRing pct={agent.uptimePct} color={agent.color} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Uptime
          </span>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Response Time
            </p>
            <RtBar ms={avgMs} maxMs={maxMs} color={agent.color} />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Success Rate
            </p>
            <StackBar success={totalReqs - totalErrs} errors={totalErrs} />
          </div>
        </div>
      </div>

      {/* 24h sparkline */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            24h Traffic
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {new Date().toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <Sparkline hours={agent.hours as unknown as HourStat[]} color={agent.color} />
        <div className="mt-1.5 flex justify-between text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Strip ────────────────────────────────────────────────────────────

function SummaryStrip() {
  const totalReqs = AGENTS.reduce((s, a) => s + a.hours.reduce((ss, h) => ss + h.requests, 0), 0);
  const totalErrs = AGENTS.reduce((s, a) => s + a.hours.reduce((ss, h) => ss + h.errors, 0), 0);
  const avgUptime = AGENTS.reduce((s, a) => s + a.uptimePct, 0) / AGENTS.length;
  const avgRt = Math.round(
    AGENTS.reduce((s, a) => s + a.hours.reduce((ss, h) => ss + h.avgMs, 0) / a.hours.length, 0) /
      AGENTS.length,
  );
  const stats = [
    {
      label: 'Total Requests (24h)',
      value: totalReqs.toLocaleString(),
      Icon: IconSignal,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
      shadow: '0 6px 20px rgba(79,172,254,0.35)',
    },
    {
      label: 'Total Errors',
      value: totalErrs.toString(),
      Icon: totalErrs === 0 ? IconCheckCircle : IconAlert,
      gradient:
        totalErrs === 0
          ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      shadow:
        totalErrs === 0
          ? '0 6px 20px rgba(67,233,123,0.35)'
          : '0 6px 20px rgba(245,87,108,0.35)',
    },
    {
      label: 'Avg Response Time',
      value: `${avgRt} ms`,
      Icon: IconZap,
      gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      shadow: '0 6px 20px rgba(246,211,101,0.35)',
    },
    {
      label: 'Platform Uptime',
      value: `${avgUptime.toFixed(1)}%`,
      Icon: IconActivity,
      gradient: 'linear-gradient(135deg, #582CFF 0%, #BD00FF 100%)',
      shadow: '0 6px 20px rgba(88,44,255,0.35)',
    },
  ];
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: s.gradient, boxShadow: s.shadow }}
          >
            <s.Icon className="h-5 w-5 text-white" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">{s.value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function MetricsView() {
  const maxMs = Math.max(...AGENTS.map((a) => Math.round(
    a.hours.reduce((s, h) => s + h.avgMs, 0) / a.hours.length,
  )));

  const [refreshed, setRefreshed] = useState<string | null>(null);
  const handleRefresh = () => {
    setRefreshed(new Date().toLocaleTimeString('en-SG'));
  };

  return (
    <div className="min-h-full p-6 text-white" style={{ background: 'transparent' }}>
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
              Nasiko Titan Challenge
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-500">
              Challenge 2
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Agent Performance Metrics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Per-agent stats · Last 24 hours · {AGENTS.length} agents active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {refreshed && (
            <p className="text-xs text-slate-600">Updated {refreshed}</p>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.08]"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-teal-500/10 px-4 py-2 text-xs font-medium text-teal-300 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-500/20"
          >
            <span>Calls Dashboard</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Nav tabs */}
      <div className="mb-8 flex gap-1 w-fit rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <IconPhone className="h-3.5 w-3.5" />
          <span>Calls Table</span>
        </Link>
        <span className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold" style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', border: '1px solid rgba(79,172,254,0.3)' }}>
          <IconBarChart className="h-3.5 w-3.5" />
          <span>Performance Metrics</span>
        </span>
        <Link href="/admin" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <IconFlask className="h-3.5 w-3.5" />
          <span>Test Agent</span>
        </Link>
      </div>

      {/* Summary Strip */}
      <SummaryStrip />

      {/* Agent Cards */}
      <div className="grid gap-5 xl:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} maxMs={maxMs} />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-[10px] text-slate-700">
        Mock telemetry — real-time Nasiko instrumentation via Phoenix at{' '}
        <a href="http://localhost:6006" target="_blank" rel="noopener" className="underline hover:text-slate-500">
          localhost:6006
        </a>
      </p>
    </div>
  );
}
