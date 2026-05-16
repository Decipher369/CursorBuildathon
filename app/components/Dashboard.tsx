'use client';

import { useCallback, useEffect, useState } from 'react';

type Business = {
  id: string;
  name: string;
  type: string;
  hours?: string;
  twilio_phone_number?: string;
  escalation_threshold?: string;
};

type CallRow = {
  id: string;
  phone_number: string;
  transcript?: string;
  sentiment_label?: string;
  intent?: string;
  agent_response?: string;
  escalated?: boolean;
  created_at: string;
};

type ProcessResult = {
  call_id: string;
  transcript: string;
  sentiment_score: number;
  sentiment_label: string;
  intent: string;
  response: string;
  audio_base64: string;
  escalated: boolean;
  customer: { id: string; isReturning: boolean; total_calls: number };
};

function sentimentClass(label?: string) {
  if (label === 'positive')
    return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
  if (label === 'negative')
    return 'bg-red-500/15 text-red-800 dark:text-red-200';
  return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300';
}

export default function Dashboard({ business }: { business: Business }) {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [appUrl, setAppUrl] = useState('');

  const [phone, setPhone] = useState('+6591234567');
  const [transcript, setTranscript] = useState(
    'Hi, I would like to book a table for four people tomorrow evening.',
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');

  const loadCalls = useCallback(async () => {
    const res = await fetch(`/api/calls/${business.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load calls');
    setCalls(data);
  }, [business.id]);

  useEffect(() => {
    loadCalls().catch((e) =>
      setError(e instanceof Error ? e.message : 'Failed to load calls'),
    );
    fetch('/api/config/public')
      .then((r) => r.json())
      .then((d) => setAppUrl(d.app_url || ''))
      .catch(() => {});
  }, [loadCalls]);

  async function runSimulation(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      let res: Response;

      if (inputMode === 'audio' && audioFile) {
        const form = new FormData();
        form.append('audio', audioFile);
        form.append('business_id', business.id);
        form.append('phone_number', phone);
        res = await fetch('/api/calls/from-audio', { method: 'POST', body: form });
      } else {
        res = await fetch('/api/calls/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: business.id,
            phone_number: phone,
            transcript,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Processing failed');

      setResult(data);
      await loadCalls();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed');
    } finally {
      setProcessing(false);
    }
  }

  const voiceWebhook = appUrl
    ? `${appUrl}/api/twilio/voice`
    : '/api/twilio/voice';

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">
              CallSense
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {business.name}
            </h1>
            <p className="text-sm text-zinc-500">{business.type}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono text-teal-700 dark:text-teal-300">
              {business.twilio_phone_number || 'No Twilio number'}
            </p>
            <p className="text-xs text-zinc-500">Business line</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
              {error}
            </div>
          )}

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 text-lg font-medium">Twilio setup</h2>
            <p className="mb-3 text-sm text-zinc-500">
              In Twilio Console, set your number&apos;s voice webhook to POST:
            </p>
            <code className="block break-all rounded-lg bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
              {voiceWebhook}
            </code>
            <p className="mt-3 text-xs text-zinc-500">
              Incoming calls to{' '}
              <span className="font-mono">{business.twilio_phone_number}</span>{' '}
              route to this business automatically.
            </p>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium">Simulate call</h2>
            <form onSubmit={runSimulation} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Caller phone
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    inputMode === 'text'
                      ? 'bg-teal-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('audio')}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    inputMode === 'audio'
                      ? 'bg-teal-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                  }`}
                >
                  Audio (VALSEA)
                </button>
              </div>

              {inputMode === 'text' ? (
                <textarea
                  className="h-28 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  required
                />
              ) : (
                <input
                  type="file"
                  accept="audio/*"
                  className="w-full text-sm"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  required
                />
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {processing ? 'Processing…' : 'Run agent'}
              </button>
            </form>
          </section>

          {result && (
            <section className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 dark:border-teal-900 dark:bg-teal-950/30">
              <h2 className="mb-3 text-lg font-medium">Latest response</h2>
              <div className="mb-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sentimentClass(result.sentiment_label)}`}
                >
                  {result.sentiment_label} ({result.sentiment_score})
                </span>
                <span className="rounded-full bg-zinc-500/15 px-2.5 py-0.5 text-xs font-medium">
                  {result.intent}
                </span>
                {result.escalated && (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100">
                    Escalated
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm">{result.response}</p>
              {result.audio_base64 && (
                <audio
                  controls
                  className="w-full"
                  src={`data:audio/mpeg;base64,${result.audio_base64}`}
                />
              )}
            </section>
          )}
        </div>

        <aside className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-4 text-lg font-medium">Call history</h2>
          {calls.length === 0 ? (
            <p className="text-sm text-zinc-500">No calls yet.</p>
          ) : (
            <ul className="max-h-[70vh] space-y-3 overflow-y-auto">
              {calls.map((call) => (
                <li
                  key={call.id}
                  className="rounded-lg border border-zinc-100 p-3 text-sm dark:border-zinc-800"
                >
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="font-mono text-xs">{call.phone_number}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${sentimentClass(call.sentiment_label)}`}
                    >
                      {call.sentiment_label}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-zinc-600 dark:text-zinc-400">
                    {call.transcript}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {call.intent} · {new Date(call.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}