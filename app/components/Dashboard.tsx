'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { CallRow } from '@/lib/call-stats';
import { computeKpis } from '@/lib/call-stats';
import KpiCards from './dashboard/KpiCards';
import CallCharts from './dashboard/CallCharts';
import NeedsAttention from './dashboard/NeedsAttention';
import RecentCallsTable from './dashboard/RecentCallsTable';

type Business = {
  id: string;
  name: string;
  type: string;
  hours?: string;
  twilio_phone_number?: string;
};

export default function Dashboard({ business }: { business: Business }) {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCalls = useCallback(async () => {
    const res = await fetch(`/api/calls/${business.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load calls');
    setCalls(data);
  }, [business.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount (state updates run in promise microtasks)
    void loadCalls()
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load calls'),
      )
      .finally(() => setLoading(false));
  }, [loadCalls]);

  const kpis = useMemo(() => computeKpis(calls), [calls]);

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Overview
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
            <p className="text-sm text-zinc-500">
              {business.type}
              {business.twilio_phone_number && (
                <span className="ml-2 font-mono text-zinc-400">
                  · {business.twilio_phone_number}
                </span>
              )}
            </p>
          </div>
          <Link
            href="/demo"
            className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-300 dark:hover:bg-teal-950/50"
          >
            Test agent
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Loading insights…</p>
        ) : (
          <>
            <KpiCards kpis={kpis} />
            <CallCharts calls={calls} />
            <NeedsAttention calls={calls} />
            <RecentCallsTable calls={calls} />
          </>
        )}
      </main>
    </div>
  );
}
