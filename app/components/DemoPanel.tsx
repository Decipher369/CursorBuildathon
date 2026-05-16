'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Business = {
  id: string;
  name: string;
  type: string;
  twilio_phone_number?: string;
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

export default function DemoPanel({ business }: { business: Business }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [showTwilio, setShowTwilio] = useState(false);
  const [voiceWebhook, setVoiceWebhook] = useState('');

  const [phone, setPhone] = useState('+6591234567');
  const [transcript, setTranscript] = useState(
    'Hi, I would like to book a table for four people tomorrow evening.',
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');

  useEffect(() => {
    fetch('/api/config/public')
      .then((r) => r.json())
      .then((d) => {
        const base = d.app_url || '';
        setVoiceWebhook(base ? `${base}/api/twilio/voice` : '/api/twilio/voice');
      })
      .catch(() => {});
  }, []);

  const runSimulation = useCallback(
    async (e: React.FormEvent) => {
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
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Processing failed');
      } finally {
        setProcessing(false);
      }
    },
    [audioFile, business.id, inputMode, phone, transcript],
  );

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Test agent
            </p>
            <h1 className="text-xl font-semibold">{business.name}</h1>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
          >
            Back to overview
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        )}

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
            <p className="mt-3 text-xs text-zinc-500">
              <Link href="/dashboard" className="text-teal-600 underline dark:text-teal-400">
                View on dashboard
              </Link>{' '}
              — refresh overview to see updated stats.
            </p>
          </section>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setShowTwilio(!showTwilio)}
            className="flex w-full items-center justify-between px-5 py-3 text-left text-sm text-zinc-500"
          >
            Twilio reference
            <span>{showTwilio ? '−' : '+'}</span>
          </button>
          {showTwilio && (
            <div className="border-t border-zinc-100 px-5 pb-4 dark:border-zinc-800">
              <p className="mb-2 mt-2 text-xs text-zinc-500">
                Voice webhook (POST) for {business.twilio_phone_number}:
              </p>
              <code className="block break-all rounded-lg bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
                {voiceWebhook}
              </code>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
