'use client';

import { useState } from 'react';
import type { Business } from '@/lib/business-types';
import type { CallRow } from '@/lib/call-stats';
import {
  callSummary,
  formatDuration,
  maskPhone,
} from '@/lib/call-stats';
import { sentimentClass } from '../dashboard/sentiment-utils';
import { useCalls } from '../hooks/useCalls';

function SentimentBadge({ label }: { label?: string }) {
  const normalized = label ?? 'neutral';
  const colors =
    normalized === 'positive'
      ? 'bg-emerald-100 text-emerald-800'
      : normalized === 'negative'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-800';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors}`}>
      {normalized}
    </span>
  );
}

export default function CallLogsView({ business }: { business: Business }) {
  const { calls, loading, error } = useCalls(business.id);
  const [selected, setSelected] = useState<CallRow | null>(null);

  const sorted = [...calls].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="flex min-h-full">
      <div className={`flex-1 p-8 ${selected ? 'pr-0' : ''}`}>
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Call Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Loading…' : `${sorted.length} calls`}
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {sorted.length === 0 && !loading ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No calls yet. Run a simulation from the Dashboard.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Caller Number</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Sentiment</th>
                    <th className="px-5 py-3 font-medium">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((call) => (
                    <tr
                      key={call.id}
                      onClick={() => setSelected(call)}
                      className={`cursor-pointer border-b border-slate-50 transition-colors hover:bg-teal-50/50 ${
                        selected?.id === call.id ? 'bg-teal-50' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        {new Date(call.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        {maskPhone(call.phone_number)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDuration(call.duration_seconds)}
                      </td>
                      <td className="px-5 py-3.5">
                        <SentimentBadge label={call.sentiment_label} />
                      </td>
                      <td className="max-w-xs truncate px-5 py-3.5 text-slate-600">
                        {callSummary(call)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <aside className="w-full max-w-md shrink-0 border-l border-slate-200 bg-white shadow-lg">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <p className="font-mono text-sm text-slate-900">
                {maskPhone(selected.phone_number)}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <SentimentBadge label={selected.sentiment_label} />
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${sentimentClass(selected.sentiment_label)}`}
              >
                {selected.intent ?? 'unknown'}
              </span>
              {selected.escalated && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                  Escalated
                </span>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-slate-500">Caller</p>
              <p className="rounded-xl rounded-bl-sm bg-slate-100 p-3 text-sm text-slate-800">
                {selected.transcript || '—'}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-slate-500">Agent</p>
              <p className="rounded-xl rounded-br-sm bg-teal-600 p-3 text-sm text-white">
                {selected.agent_response || '—'}
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
