'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import type { AppView, Business } from '@/lib/business-types';
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
      Loading…
    </div>
  ),
});

const viewPaths: Record<AppView, string> = {
  dashboard: '/dashboard',
  'call-logs': '/call-logs',
  agent: '/agent',
  settings: '/settings',
  admin: '/admin',
};

const viewVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export default function CallSenseApp({
  business: initialBusiness,
  initialView = 'dashboard',
}: {
  business: Business;
  initialView?: AppView;
}) {
  const [view, setView] = useState<AppView>(initialView);
  const [business, setBusiness] = useState(initialBusiness);

  // Instant client-side switch — no server round-trip
  const onNavigate = useCallback((next: AppView) => {
    setView(next);
    // Keep URL in sync for browser history / deep links without triggering navigation
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', viewPaths[next]);
    }
  }, []);

  const onSaved = useCallback((updated: Business) => {
    setBusiness(updated);
  }, []);

  return (
    <AppShell business={business} activeView={view} onNavigate={onNavigate}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          variants={viewVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === 'dashboard' && <DashboardView business={business} />}
          {view === 'call-logs' && <CallLogsView business={business} />}
          {view === 'agent' && <AgentView business={business} onSaved={onSaved} />}
          {view === 'settings' && <SettingsView business={business} onSaved={onSaved} />}
          {view === 'admin' && <AdminView business={business} />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
