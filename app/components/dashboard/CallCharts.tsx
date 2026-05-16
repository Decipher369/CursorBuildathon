'use client';

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CallRow } from '@/lib/call-stats';
import {
  computeCallsByDay,
  computeIntentCounts,
  computeSentimentSlices,
} from '@/lib/call-stats';

export default function CallCharts({ calls }: { calls: CallRow[] }) {
  const byDay = computeCallsByDay(calls);
  const intents = computeIntentCounts(calls);
  const sentiment = computeSentimentSlices(calls);
  const hasCalls = calls.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-medium text-zinc-500">Calls (last 7 days)</h2>
        {!hasCalls ? (
          <p className="py-12 text-center text-sm text-zinc-400">No call data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDay}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-medium text-zinc-500">Sentiment mix</h2>
        {!hasCalls || sentiment.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-400">No sentiment data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sentiment}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {sentiment.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
        <h2 className="mb-4 text-sm font-medium text-zinc-500">Top intents</h2>
        {!hasCalls || intents.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No intents yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, intents.length * 36)}>
            <BarChart data={intents} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="intent" tick={{ fontSize: 11 }} width={75} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
