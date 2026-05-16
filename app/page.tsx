import Link from 'next/link';
import { getAllBusinesses } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/* ─── Inline SVG icons ──────────────────────────────────────────── */
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  );
}
function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 15h.01M16 15h.01" />
    </svg>
  );
}
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function UtensilsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6h3v7" />
    </svg>
  );
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ─── Landing Page ──────────────────────────────────────────────── */
export default async function HomePage() {
  let hasApp = false;
  let businessName = '';
  try {
    const businesses = await getAllBusinesses();
    hasApp = (businesses?.length ?? 0) > 0;
    if (hasApp) businessName = businesses[0]?.name ?? '';
  } catch {
    /* DB unavailable — show landing anyway */
  }

  const ctaHref = hasApp ? '/dashboard' : '/signin';
  const ctaLabel = hasApp ? `Open Dashboard` : 'Get Started Free';

  return (
    <div className="min-h-screen bg-[#080c10] text-white font-sans overflow-x-hidden">

      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080c10]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C896] text-sm font-black text-[#080c10]">
              CS
            </span>
            <span className="text-lg font-bold tracking-tight">CallSense</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="text-sm text-slate-400 hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {hasApp && (
              <Link href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm text-[#00C896] hover:text-emerald-300 transition-colors font-medium">
                {businessName && <span className="max-w-[120px] truncate text-slate-400">{businessName}</span>}
                <span>Dashboard</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link href={ctaHref}
              className="rounded-lg bg-[#00C896] px-4 py-2 text-sm font-semibold text-[#080c10] hover:bg-[#00b386] transition-colors">
              {hasApp ? 'Open App' : 'Get Started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#00C896]/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00C896]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-4 py-1.5 text-xs font-medium text-[#00C896] mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
              Live AI Agents · Powered by Valsea
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.03] tracking-tight mb-6">
              Your AI Call Center,{' '}
              <span className="bg-gradient-to-r from-[#00C896] to-emerald-400 bg-clip-text text-transparent">
                Ready in Minutes
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              Just call us, tell us about your business, and we&apos;ll deploy a custom AI agent that handles all your customer calls 24/7 — no code, no setup, no hassle.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={ctaHref}
                className="rounded-xl bg-[#00C896] px-6 py-3 font-semibold text-[#080c10] hover:bg-[#00b386] transition-all hover:scale-105 shadow-lg shadow-[#00C896]/25">
                {hasApp ? '→ Open Dashboard' : 'Set Up Your Agent'}
              </Link>
              <a href="#how-it-works"
                className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white hover:bg-white/5 transition-all">
                See How It Works ↓
              </a>
            </div>

            {hasApp && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#00C896]/20 bg-[#00C896]/5 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#00C896] animate-pulse" />
                <span className="text-sm text-[#00C896] font-medium">
                  Your agent is live — <Link href="/dashboard" className="underline underline-offset-2">view dashboard</Link>
                </span>
              </div>
            )}

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {['#00C896', '#3b82f6', '#f59e0b', '#ec4899'].map((c, i) => (
                  <div key={i}
                    className="h-8 w-8 rounded-full border-2 border-[#080c10] flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: c }}>
                    {['R', 'M', 'S', 'A'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3.5 w-3.5 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-500">Trusted by 500+ businesses in SEA</p>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-72">
              <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 p-1.5 shadow-2xl shadow-black/60">
                <div className="rounded-[2rem] bg-[#0d1117] overflow-hidden">
                  <div className="flex justify-between items-center px-6 py-3 text-xs text-slate-500">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="h-2 w-4 rounded-sm bg-[#00C896]" />
                      <div className="h-2 w-1 rounded-sm bg-slate-600" />
                    </div>
                  </div>
                  <div className="text-center py-4 border-b border-white/5">
                    <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-[#00C896] to-emerald-600 flex items-center justify-center mb-2">
                      <BotIcon className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-sm font-semibold">CallSense Agent</p>
                    <div className="inline-flex items-center gap-1.5 mt-1 text-xs text-[#00C896]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
                      Connected · 0:42
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { text: "Hi! I'd like to book a table for 4 at 7pm tonight", isUser: true },
                      { text: "Of course! I can book that for you right away. Can I get your name?", isUser: false },
                      { text: "Sarah Chen", isUser: true },
                      { text: "Perfect, Sarah! Table for 4 at 7pm — confirmed! 🎉", isUser: false },
                    ].map((msg, i) => (
                      <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          msg.isUser
                            ? 'bg-[#00C896]/20 text-[#00C896] rounded-br-sm'
                            : 'bg-white/[0.08] text-slate-300 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-start">
                      <div className="bg-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 pb-6 pt-2">
                    {['Mute', 'Speaker', 'End'].map((label, i) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs ${
                          label === 'End' ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-slate-400'
                        }`}>
                          {['🔇', '🔊', '📵'][i]}
                        </div>
                        <span className="text-[10px] text-slate-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -left-10 top-20 rounded-xl bg-slate-800/90 border border-white/10 px-3 py-2 text-xs backdrop-blur shadow-xl">
                <div className="text-[#00C896] font-semibold">24/7 Active</div>
                <div className="text-slate-500">Never misses a call</div>
              </div>
              <div className="absolute -right-8 bottom-24 rounded-xl bg-slate-800/90 border border-white/10 px-3 py-2 text-xs backdrop-blur shadow-xl">
                <div className="text-amber-400 font-semibold">98% Accuracy</div>
                <div className="text-slate-500">SEA voices</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 py-12 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-600 mb-8">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {[
              { name: 'OpenAI', symbol: '⬛' },
              { name: 'Valsea', symbol: '◆' },
              { name: 'Supabase', symbol: '⚡' },
              { name: 'Twilio', symbol: '●' },
            ].map(({ name, symbol }) => (
              <div key={name}
                className="text-slate-600 font-bold text-xl tracking-tight hover:text-slate-400 transition-colors select-none">
                {symbol} {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00C896] mb-3">Simple Process</p>
            <h2 className="text-4xl font-black tracking-tight">Up and running in 2 steps</h2>
            <p className="mt-3 text-slate-400 max-w-md mx-auto">From zero to a live AI call center agent in under 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                step: '01', title: 'We Build Your Agent',
                desc: 'Our AI instantly trains a custom agent on your business info, personality, and escalation rules.',
                Icon: BotIcon,
                gradient: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', iconColor: 'text-blue-400',
                link: hasApp ? '/agent' : null, linkLabel: 'Configure agent →',
              },
              {
                step: '02', title: 'Go Live Immediately',
                desc: "Your customers call your number and speak with your AI agent — 24/7, in any language, zero missed calls.",
                Icon: ZapIcon,
                gradient: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', iconColor: 'text-amber-400',
                link: hasApp ? '/call-logs' : null, linkLabel: 'View call logs →',
              },
            ].map(({ step, title, desc, Icon, gradient, border, iconColor, link, linkLabel }) => (
              <div key={step}
                className={`relative rounded-2xl border ${border} bg-gradient-to-b ${gradient} p-8 hover:scale-[1.02] transition-transform`}>
                <div className="text-xs font-black tracking-widest text-slate-600 mb-4">{step}</div>
                <div className="mb-4 h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{desc}</p>
                {link && (
                  <Link href={link} className={`text-xs font-semibold ${iconColor} hover:opacity-80 transition-opacity`}>
                    {linkLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00C896] mb-3">Everything You Need</p>
            <h2 className="text-4xl font-black tracking-tight">Built for real businesses</h2>
            <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">
              Enterprise-grade AI calling, designed for Southeast Asia.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: GlobeIcon, title: 'Understands Any Accent', tag: 'Valsea AI',
                desc: 'Powered by Valsea — trained specifically for Southeast Asian voices, Singlish, and regional dialects.' },
              { Icon: ClockIcon, title: 'Always Available', tag: '24/7',
                desc: 'Your AI agent answers every call, day or night, on weekends and public holidays. Zero missed calls.' },
              { Icon: ShieldIcon, title: 'Smart Escalation', tag: 'Intelligent',
                desc: 'Knows exactly when a situation needs a human touch and seamlessly hands off the call.' },
              { Icon: BarChartIcon, title: 'Call Summaries', tag: 'Analytics',
                desc: 'Every call is logged with a full transcript, sentiment score, and intent classification.' },
              { Icon: GlobeIcon, title: 'Multi-language', tag: '6+ Languages',
                desc: 'Speaks English, Singlish, Malay, Tamil, Mandarin, and more — naturally.' },
              { Icon: ZapIcon, title: 'Easy Setup', tag: 'No-code',
                desc: "No code, no technical knowledge, no IT team. You're live in minutes with a single phone call." },
            ].map(({ Icon, title, desc, tag }) => (
              <div key={title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-[#00C896]/40 hover:bg-[#00C896]/5 transition-all cursor-default">
                <div className="mb-4 flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl bg-[#00C896]/10 flex items-center justify-center group-hover:bg-[#00C896]/20 transition-colors">
                    <Icon className="h-5 w-5 text-[#00C896]" />
                  </div>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">{tag}</span>
                </div>
                <h3 className="text-base font-bold mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00C896] mb-3">Use Cases</p>
            <h2 className="text-4xl font-black tracking-tight">Works for every business</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { Icon: UtensilsIcon, title: 'Restaurants', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
                desc: 'Handle reservations, takeaway orders, and opening hours automatically.' },
              { Icon: HeartIcon, title: 'Clinics', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
                desc: 'Book appointments, answer FAQs, and triage urgent calls to staff.' },
              { Icon: ShoppingBagIcon, title: 'Retail Stores', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20',
                desc: 'Answer product queries, stock availability, and store hours.' },
              { Icon: TruckIcon, title: 'Logistics', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20',
                desc: 'Track orders, handle delivery queries, and escalate issues in real time.' },
            ].map(({ Icon, title, desc, color, bg, border }) => (
              <div key={title}
                className={`rounded-2xl border ${border} ${bg} p-6 hover:scale-[1.03] transition-transform`}>
                <div className="mb-4 h-12 w-12 rounded-xl bg-black/20 flex items-center justify-center">
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-base font-bold mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO STRIP (only when app is set up) ─────────────── */}
      {hasApp && (
        <section className="py-16 border-y border-[#00C896]/15 bg-[#00C896]/5">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-medium text-[#00C896] mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
                Your agent is live
              </div>
              <h3 className="text-2xl font-black">Try your AI agent right now</h3>
              <p className="text-slate-400 text-sm mt-1">Simulate a call, review transcripts, and tune your agent — all from the dashboard.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/dashboard"
                className="rounded-xl bg-[#00C896] px-5 py-2.5 text-sm font-bold text-[#080c10] hover:bg-[#00b386] transition-colors shadow-lg shadow-[#00C896]/25">
                Simulate a Call
              </Link>
              <Link href="/call-logs"
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/5 transition-colors">
                View Call Logs
              </Link>
              <Link href="/agent"
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/5 transition-colors">
                Configure Agent
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00C896] mb-3">Pricing</p>
            <h2 className="text-4xl font-black tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-3 text-slate-400 text-lg">Start free. Scale when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Starter</p>
                <p className="text-4xl font-black">Free</p>
                <p className="text-sm text-slate-500 mt-1">Forever free</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {['1 AI agent', '100 calls / month', 'Basic analytics', 'Email support'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckIcon className="h-4 w-4 text-[#00C896] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={ctaHref}
                className="block text-center rounded-xl border border-white/15 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">
                {hasApp ? 'Open Dashboard' : 'Get Started Free'}
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-[#00C896] bg-gradient-to-b from-[#00C896]/10 to-transparent p-8 flex flex-col shadow-xl shadow-[#00C896]/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#00C896] px-4 py-1 text-[11px] font-bold text-[#080c10] uppercase tracking-wide">
                Most Popular
              </div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#00C896] mb-2">Growth</p>
                <div className="flex items-end gap-1">
                  <p className="text-4xl font-black">$49</p>
                  <p className="text-slate-400 mb-1">/mo</p>
                </div>
                <p className="text-sm text-slate-500 mt-1">Everything you need to scale</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {['5 AI agents', 'Unlimited calls', 'Sentiment analysis', 'Call summaries', 'Priority support', 'Custom voice'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckIcon className="h-4 w-4 text-[#00C896] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={ctaHref}
                className="block text-center rounded-xl bg-[#00C896] py-3 text-sm font-bold text-[#080c10] hover:bg-[#00b386] transition-colors shadow-lg shadow-[#00C896]/30">
                {hasApp ? 'Open Dashboard' : 'Start Free Trial'}
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Enterprise</p>
                <p className="text-4xl font-black">Custom</p>
                <p className="text-sm text-slate-500 mt-1">For large organisations</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {['Unlimited agents', 'Custom voices', 'Dedicated support', 'SLA guarantee', 'On-premise option', 'White-label'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckIcon className="h-4 w-4 text-[#00C896] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@callsense.ai"
                className="block text-center rounded-xl border border-white/15 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="relative rounded-3xl border border-[#00C896]/20 bg-gradient-to-b from-[#00C896]/10 to-transparent p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00C896]/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00C896]/15 rounded-full blur-[80px] pointer-events-none" />
            <p className="relative text-xs font-semibold uppercase tracking-widest text-[#00C896] mb-4">
              {hasApp ? 'You\'re All Set' : 'Get Started Today'}
            </p>
            <h2 className="relative text-4xl md:text-5xl font-black tracking-tight mb-4">
              {hasApp
                ? 'Your AI call center is live!'
                : 'Ready to transform your call center?'}
            </h2>
            <p className="relative text-slate-400 text-lg mb-8">
              {hasApp
                ? 'View your dashboard to see live call stats, transcripts, and manage your agent.'
                : 'No credit card required. Your agent goes live in minutes.'}
            </p>
            <Link href={ctaHref}
              className="relative inline-block rounded-xl bg-[#00C896] px-8 py-4 text-base font-bold text-[#080c10] hover:bg-[#00b386] transition-all hover:scale-105 shadow-xl shadow-[#00C896]/30">
              {hasApp ? 'Open Dashboard →' : 'Get Started Free →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C896] text-xs font-black text-[#080c10]">CS</span>
            <span className="font-bold text-sm">CallSense</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            {['Privacy Policy', 'Terms', 'Contact'].map((link) => (
              <a key={link} href="#" className="hover:text-slate-300 transition-colors">{link}</a>
            ))}
            {hasApp && (
              <Link href="/dashboard" className="text-[#00C896] hover:text-emerald-300 transition-colors font-medium">
                Dashboard
              </Link>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Powered by <span className="text-slate-400">Valsea AI</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
