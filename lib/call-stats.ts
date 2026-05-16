export type CallRow = {
  id: string;
  phone_number: string;
  transcript?: string;
  sentiment_label?: string;
  sentiment_score?: number;
  intent?: string;
  agent_response?: string;
  escalated?: boolean;
  created_at: string;
};

export type CallKpis = {
  totalCalls: number;
  callsToday: number;
  escalatedCount: number;
  escalatedPercent: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  uniqueCallers: number;
  returningCallers: number;
};

export type DayCount = { date: string; label: string; count: number };
export type IntentCount = { intent: string; count: number };
export type SentimentSlice = { name: string; value: number; fill: string };

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  neutral: '#71717a',
  negative: '#ef4444',
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isToday(iso: string) {
  return startOfDay(new Date(iso)).getTime() === startOfDay(new Date()).getTime();
}

export function computeKpis(calls: CallRow[]): CallKpis {
  const total = calls.length;
  const today = calls.filter((c) => isToday(c.created_at)).length;
  const escalated = calls.filter((c) => c.escalated).length;

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  for (const c of calls) {
    const label = c.sentiment_label ?? 'neutral';
    if (label in sentimentCounts) {
      sentimentCounts[label as keyof typeof sentimentCounts]++;
    } else {
      sentimentCounts.neutral++;
    }
  }

  const phoneCounts = new Map<string, number>();
  for (const c of calls) {
    phoneCounts.set(c.phone_number, (phoneCounts.get(c.phone_number) ?? 0) + 1);
  }
  const uniqueCallers = phoneCounts.size;
  const returningCallers = [...phoneCounts.values()].filter((n) => n > 1).length;

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return {
    totalCalls: total,
    callsToday: today,
    escalatedCount: escalated,
    escalatedPercent: pct(escalated),
    positivePercent: pct(sentimentCounts.positive),
    neutralPercent: pct(sentimentCounts.neutral),
    negativePercent: pct(sentimentCounts.negative),
    uniqueCallers,
    returningCallers,
  };
}

export function computeCallsByDay(calls: CallRow[], days = 7): DayCount[] {
  const result: DayCount[] = [];
  const now = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const count = calls.filter(
      (c) => startOfDay(new Date(c.created_at)).getTime() === d.getTime(),
    ).length;
    result.push({ date: key, label, count });
  }
  return result;
}

export function computeIntentCounts(calls: CallRow[], limit = 5): IntentCount[] {
  const map = new Map<string, number>();
  for (const c of calls) {
    const intent = c.intent?.trim() || 'unknown';
    map.set(intent, (map.get(intent) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function computeSentimentSlices(calls: CallRow[]): SentimentSlice[] {
  const kpis = computeKpis(calls);
  return [
    { name: 'Positive', value: kpis.positivePercent, fill: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: kpis.neutralPercent, fill: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: kpis.negativePercent, fill: SENTIMENT_COLORS.negative },
  ].filter((s) => s.value > 0);
}

export function computeNeedsAttention(calls: CallRow[]): CallRow[] {
  return calls
    .filter(
      (c) =>
        c.escalated === true ||
        c.sentiment_label === 'negative',
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, -4).replace(/\d/g, '•')}${phone.slice(-4)}`;
}
