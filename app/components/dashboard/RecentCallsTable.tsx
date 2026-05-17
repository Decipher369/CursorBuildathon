'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CallRow } from '@/lib/call-stats';
import { maskPhone } from '@/lib/call-stats';
import CallAudioListenButton from '../CallAudioListenButton';
import { sentimentClass } from './sentiment-utils';

export default function RecentCallsTable({ calls }: { calls: CallRow[] }) {
  const [selected, setSelected] = useState<CallRow | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    backdropRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const recent = [...calls].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <>
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-medium text-zinc-500">Recent calls</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No calls yet. Use{' '}
            <Link href="/admin" prefetch className="text-teal-600 underline dark:text-teal-400">
              Test agent
            </Link>{' '}
            to simulate one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="pb-2 pr-4 font-medium">Time</th>
                  <th className="pb-2 pr-4 font-medium">Caller</th>
                  <th className="pb-2 pr-4 font-medium">Intent</th>
                  <th className="pb-2 pr-4 font-medium">Sentiment</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Audio</th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 15).map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelected(call)}
                    className="cursor-pointer border-b border-zinc-50 hover:bg-zinc-50 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50"
                  >
                    <td className="py-2.5 pr-4 text-xs text-zinc-500">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs">
                      {maskPhone(call.phone_number)}
                    </td>
                    <td className="py-2.5 pr-4">{call.intent ?? '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${sentimentClass(call.sentiment_label)}`}
                      >
                        {call.sentiment_label ?? '—'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      {call.escalated ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          Escalated
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">OK</span>
                      )}
                    </td>
                    <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                      <CallAudioListenButton audio_base64={call.audio_base64} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
          role="presentation"
          tabIndex={-1}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm">{maskPhone(selected.phone_number)}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                Close
              </button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${sentimentClass(selected.sentiment_label)}`}
              >
                {selected.sentiment_label ?? '—'}
              </span>
              <span className="rounded-full bg-zinc-500/15 px-2.5 py-0.5 text-xs">
                {selected.intent ?? '—'}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="mb-1 text-xs font-medium text-zinc-500">Caller said</p>
                <p className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  {selected.transcript ?? <span className="italic text-zinc-400">No transcript</span>}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-zinc-500">Agent response</p>
                <p className="rounded-lg bg-teal-50 p-3 dark:bg-teal-950/40">
                  {selected.agent_response ?? <span className="italic text-zinc-400">No response</span>}
                </p>
                <div className="mt-2">
                  <CallAudioListenButton audio_base64={selected.audio_base64} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
