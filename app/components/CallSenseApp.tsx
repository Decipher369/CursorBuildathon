'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { AppView, Business } from '@/lib/business-types';
import AppShell from './AppShell';
import AgentView from './views/AgentView';
import CallLogsView from './views/CallLogsView';
import DashboardView from './views/DashboardView';
import SettingsView from './views/SettingsView';

const viewPaths: Record<AppView, string> = {
  dashboard: '/',
  'call-logs': '/call-logs',
  agent: '/agent',
  settings: '/settings',
};

const pathToView: Record<string, AppView> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/call-logs': 'call-logs',
  '/agent': 'agent',
  '/settings': 'settings',
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

  const onSaved = useCallback((updated: Business) => {
    setBusiness(updated);
  }, []);

  return (
    <AppShell business={business} activeView={view} onNavigate={onNavigate}>
      {view === 'dashboard' && <DashboardView business={business} />}
      {view === 'call-logs' && <CallLogsView business={business} />}
      {view === 'agent' && <AgentView business={business} onSaved={onSaved} />}
      {view === 'settings' && <SettingsView business={business} onSaved={onSaved} />}
    </AppShell>
  );
}
