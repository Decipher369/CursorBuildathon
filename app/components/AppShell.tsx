'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { AppView, Business } from '@/lib/business-types';
import { IconAgent, IconCallLogs, IconDashboard, IconSettings } from './icons';

const nav: { id: AppView; label: string; Icon: typeof IconDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'agent', label: 'My Agent', Icon: IconAgent },
  { id: 'call-logs', label: 'Call Logs', Icon: IconCallLogs },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
];

function Sidebar({
  business,
  activeView,
  onNavigate,
  onClose,
}: {
  business: Business;
  activeView: AppView;
  onNavigate: (v: AppView) => void;
  onClose?: () => void;
}) {
  const initials = business.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col border-r border-white/[0.06] bg-slate-950">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white">
            CS
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">CallSense</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ id, label, Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onNavigate(id);
                onClose?.();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/20'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{business.name}</p>
            {business.twilio_phone_number && (
              <p className="truncate font-mono text-xs text-slate-500">
                {business.twilio_phone_number}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-slate-950 text-slate-100">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:flex lg:flex-col">
        <Sidebar business={business} activeView={activeView} onNavigate={onNavigate} />
      </aside>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden"
            >
              <Sidebar
                business={business}
                activeView={activeView}
                onNavigate={onNavigate}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile top bar ── */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-slate-950/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-xs font-bold text-white">
          CS
        </span>
        <span className="text-sm font-semibold text-white">CallSense</span>
      </div>

      {/* ── Main content ── */}
      <main className="min-h-full w-full flex-1 pt-14 lg:ml-60 lg:pt-0">{children}</main>
    </div>
  );
}
