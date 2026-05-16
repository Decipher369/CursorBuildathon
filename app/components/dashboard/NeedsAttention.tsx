import type { CallRow } from '@/lib/call-stats';
import { computeNeedsAttention, maskPhone } from '@/lib/call-stats';
import { sentimentClass } from './sentiment-utils';

export default function NeedsAttention({ calls }: { calls: CallRow[] }) {
  const items = computeNeedsAttention(calls);

  return (
    <section className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
      <h2 className="mb-3 text-sm font-medium text-amber-900 dark:text-amber-100">
        Needs attention
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No escalations or negative calls.</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map((call) => (
            <li
              key={call.id}
              className="rounded-lg border border-amber-200/50 bg-white/80 px-3 py-2 text-sm dark:border-amber-900/40 dark:bg-zinc-900/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs">{maskPhone(call.phone_number)}</span>
                <span className="flex gap-1">
                  {call.escalated && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium">
                      Escalated
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${sentimentClass(call.sentiment_label)}`}
                  >
                    {call.sentiment_label}
                  </span>
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-zinc-600 dark:text-zinc-400">
                {call.transcript}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
