'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AppView, Business } from '@/lib/business-types';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import {
  IconAgent,
  IconBarChart,
  IconCallLogs,
  IconDashboard,
  IconFlask,
  IconHeadphones,
  IconSettings,
} from './icons';

const nav: { id: AppView; label: string; Icon: typeof IconDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'agent', label: 'My Agent', Icon: IconAgent },
  { id: 'call-logs', label: 'Call Logs', Icon: IconCallLogs },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
];

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Dashboard',
  agent: 'My Agent',
  'call-logs': 'Call Logs',
  settings: 'Settings',
};

export default function AppShell({
  business,
  activeView,
  onNavigate,
  children,
}: {
  business: Business;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  }

  const initials = business.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen relative">
      {/* Floating animated orbs (background) */}
      <div className="orb" style={{ top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(94,84,215,0.6), transparent 70%)', animation: 'orb-float-1 18s ease-in-out infinite' }} />
      <div className="orb" style={{ top: '40%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,212,255,0.4), transparent 70%)', animation: 'orb-float-2 22s ease-in-out infinite' }} />
      <div className="orb" style={{ bottom: '-15%', left: '30%', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(186,79,255,0.45), transparent 70%)', animation: 'orb-float-3 20s ease-in-out infinite' }} />

      {/* Sidebar */}
      <aside className="fixed inset-y-4 left-4 z-30 flex w-64 flex-col rounded-3xl glass" style={{ height: 'calc(100vh - 2rem)' }}>
        {/* Logo */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
                boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
              }}
            >
              CS
              <div className="absolute inset-0 rounded-xl spin-slow" style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1px' }} />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">CallSense</span>
              <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>AI Voice Platform</p>
            </div>
          </div>
        </div>

        <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

        <p className="mt-5 mb-2 px-6 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Pages
        </p>

        {/* Nav */}
        <nav className="space-y-1 px-3">
          {nav.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300"
                style={
                  active
                    ? {
                        background: 'linear-gradient(127deg, rgba(6, 11, 40, 0.94) 28.26%, rgba(10, 14, 35, 0.49) 91.2%)',
                        color: '#fff',
                      }
                    : {
                        color: 'rgba(255,255,255,0.55)',
                      }
                }
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all"
                  style={{
                    background: active ? 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)' : 'rgba(255,255,255,0.08)',
                    boxShadow: active ? '0 4px 12px rgba(79,172,254,0.4)' : 'none',
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)' }} />
                </span>
                <span className={active ? 'font-bold' : ''}>{label}</span>
              </button>
            );
          })}

          <p className="mt-5 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Tools
          </p>

          <a href="/metrics" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <IconBarChart className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.65)' }} />
            </span>
            Metrics
          </a>
          <a href="/admin" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <IconFlask className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.65)' }} />
            </span>
            Test Agent
          </a>
        </nav>

        {/* Bottom section */}
        <div className="mt-auto m-3 mb-4 space-y-3">
          {/* Promo card */}
          <div
            className="relative overflow-hidden rounded-2xl p-4"
            style={{ boxShadow: '0 10px 30px rgba(88, 44, 255, 0.35)' }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/promo-waves.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(160deg, rgba(20, 8, 50, 0.45) 0%, rgba(15, 6, 40, 0.7) 100%)' }}
            />
            <div className="relative">
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
              >
                <IconHeadphones className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-bold text-white">Need help?</p>
              <p className="mt-0.5 text-[10px] text-white/80 leading-relaxed">
                Please check our docs
              </p>
              <a
                href="https://github.com/Decipher369/CursorBuildathon"
                target="_blank"
                rel="noopener"
                className="mt-3 block w-full rounded-xl py-2 text-center text-[10px] font-bold tracking-wider text-white transition-all hover:opacity-90"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                DOCUMENTATION
              </a>
            </div>
          </div>

          <a
            href="/admin"
            className="block w-full rounded-xl py-2.5 text-center text-[11px] font-bold tracking-wider text-white transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
            }}
          >
            TEST AGENT
          </a>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{
              background: 'rgba(245,87,108,0.1)',
              border: '1px solid rgba(245,87,108,0.25)',
              color: '#f5576c',
            }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-72 mr-4 min-h-screen flex-1">
        {/* Top bar */}
        <div className="sticky top-4 z-20 mt-4 flex items-center justify-between rounded-2xl glass px-5 py-3">
          <div>
            <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Pages / <span className="text-white">{VIEW_TITLES[activeView]}</span>
            </p>
            <p className="text-base font-bold text-white">{VIEW_TITLES[activeView]}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 w-56" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Type here...</span>
            </div>

            {/* Profile + sign out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all hover:bg-white/10 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)' }}>
                {initials}
              </div>
              <span className="text-xs font-semibold text-white">{business.name.split(' ')[0]}</span>
              <svg className="h-3 w-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

            {/* Settings cog */}
            <button className="flex h-9 w-9 items-center justify-center rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: '#f5576c', boxShadow: '0 0 6px #f5576c' }} />
            </button>
          </div>
        </div>

        <div>{children}</div>
      </main>
    </div>
  );
}
