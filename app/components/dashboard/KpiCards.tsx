import type { CallKpis } from '@/lib/call-stats';

const cards: {
  key: keyof CallKpis;
  label: string;
  format?: (v: number) => string;
}[] = [
  { key: 'totalCalls', label: 'Total calls' },
  { key: 'callsToday', label: 'Calls today' },
  { key: 'escalatedCount', label: 'Escalations' },
  { key: 'escalatedPercent', label: 'Escalation rate', format: (v) => `${v}%` },
  { key: 'positivePercent', label: 'Positive sentiment', format: (v) => `${v}%` },
  { key: 'returningCallers', label: 'Returning callers' },
];

export default function KpiCards({ kpis }: { kpis: CallKpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ key, label, format }) => {
        const raw = kpis[key];
        const value =
          typeof raw === 'number' ? (format ? format(raw) : String(raw)) : String(raw);
        return (
          <div
            key={key}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
