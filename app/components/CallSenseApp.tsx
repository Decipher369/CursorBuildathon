'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppView, Business } from '@/lib/business-types';
import { APP_PREFETCH_HREFS } from '@/lib/app-prefetch';
import AppShell from './AppShell';
import AgentView from './views/AgentView';
import CallLogsView from './views/CallLogsView';
import DashboardView from './views/DashboardView';
import SettingsView from './views/SettingsView';

const AdminView = dynamic(() => import('./views/AdminView'), {
  loading: () => (
    <div
      className="flex min-h-[50vh] items-center justify-center text-sm"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      Loading Test Agent…
    </div>
  ),
});

const viewPaths: Record<AppView, string> = {
  dashboard: '/',
  'call-logs': '/call-logs',
  agent: '/agent',
  settings: '/settings',
  admin: '/admin',
};

const pathToView: Record<string, AppView> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/call-logs': 'call-logs',
  '/agent': 'agent',
  '/settings': 'settings',
  '/admin': 'admin',
};

export default function CallSenseApp({
  business: initialBusiness,
  initialView = 'dashboard',
}: {
  business: Business;
  initialView?: AppView;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [business, setBusiness] = useState(initialBusiness);

  const view = useMemo(
    () => pathToView[pathname] ?? initialView,
    [pathname, initialView],
  );

  const onNavigate = useCallback(
    (next: AppView) => {
      router.push(viewPaths[next]);
    },
    [router],
  );

  useEffect(() => {
    APP_PREFETCH_HREFS.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
    });
  }, [router]);

  const onSaved = useCallback((updated: Business) => {
    setBusiness(updated);
  }, []);

  return (
    <AppShell business={business} activeView={view} onNavigate={onNavigate}>
      {view === 'dashboard' && <DashboardView business={business} />}
      {view === 'call-logs' && <CallLogsView business={business} />}
      {view === 'agent' && <AgentView business={business} onSaved={onSaved} />}
      {view === 'settings' && <SettingsView business={business} />}
      {view === 'admin' && <AdminView business={business} />}
    </AppShell>
  );
}
