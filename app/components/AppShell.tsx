'use client';

import type { AppView, Business } from '@/lib/business-types';
import {
  IconAgent,
  IconCallLogs,
  IconDashboard,
  IconSettings,
} from './icons';

const nav: { id: AppView; label: string; Icon: typeof IconDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'agent', label: 'My Agent', Icon: IconAgent },
  { id: 'call-logs', label: 'Call Logs', Icon: IconCallLogs },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
];

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
  const initials = business.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-full bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/[0.06] bg-slate-950 text-slate-300">
        <div className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white">
              CS
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              CallSense
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal-600/20 text-teal-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
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
      </aside>

      <main className="ml-60 min-h-full flex-1">{children}</main>
    </div>
  );
}
