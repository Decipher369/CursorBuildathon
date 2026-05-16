'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Business } from '@/lib/business-types';
import {
  computeAvgDurationSeconds,
  computeKpis,
  formatDuration,
} from '@/lib/call-stats';
import { useCalls } from '../hooks/useCalls';

type ProcessResult = {
  call_id: string;
  transcript: string;
  sentiment_score: number;
  sentiment_label: string;
  intent: string;
  response: string;
  audio_base64: string;
  escalated: boolean;
};

type ChatMessage = {
  id: string;
  role: 'caller' | 'agent' | 'system';
  text: string;
};

export default function DashboardView({ business }: { business: Business }) {
  const { calls, loading, error, reload } = useCalls(business.id);
  const kpis = useMemo(() => computeKpis(calls), [calls]);
  const avgDuration = formatDuration(computeAvgDurationSeconds(calls));

  const [processing, setProcessing] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);

  const [phone, setPhone] = useState('+6591234567');
  const [transcript, setTranscript] = useState(
    'Hi, I would like to book a table for four people tomorrow evening.',
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');

  const pushMessage = useCallback((role: ChatMessage['role'], text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, text },
    ]);
  }, []);

  const runSimulation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setProcessing(true);
      setRunError(null);
      setResult(null);
      setMessages([]);
      setShowTranscript(true);

      const callerText =
        inputMode === 'text'
          ? transcript
          : 'Processing audio with VALSEA…';

      pushMessage('caller', callerText);

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

        if (inputMode === 'audio' && data.transcript) {
          setMessages((prev) => {
            const next = [...prev];
            const idx = next.findIndex((m) => m.role === 'caller');
            if (idx >= 0) next[idx] = { ...next[idx], text: data.transcript };
            return next;
          });
        }

        await new Promise((r) => setTimeout(r, 400));
        pushMessage('system', 'Agent is thinking…');
        await new Promise((r) => setTimeout(r, 600));
        setMessages((prev) => prev.filter((m) => m.role !== 'system'));
        pushMessage('agent', data.response);

        setResult(data);
        await reload();
      } catch (e) {
        setRunError(e instanceof Error ? e.message : 'Processing failed');
        setMessages((prev) => prev.filter((m) => m.role !== 'system'));
      } finally {
        setProcessing(false);
      }
    },
    [
      audioFile,
      business.id,
      inputMode,
      phone,
      pushMessage,
      reload,
      transcript,
    ],
  );

  useEffect(() => {
    if (!showTranscript) return;
    const el = document.getElementById('live-transcript');
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, showTranscript]);

  const stats = [
    { label: 'Calls Today', value: String(kpis.callsToday) },
    { label: 'Positive Sentiment %', value: `${kpis.positivePercent}%` },
    { label: 'Avg Duration', value: avgDuration },
    { label: 'Escalated', value: String(kpis.escalatedCount) },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {business.name}
          {business.twilio_phone_number && (
            <span className="ml-2 font-mono text-slate-400">
              · {business.twilio_phone_number}
            </span>
          )}
        </p>
      </header>

      {(error || runError) && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error || runError}
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {loading ? '—' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Simulate call</h2>
          <form onSubmit={runSimulation} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Caller phone
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                    : 'bg-slate-100 text-slate-600'
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
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Audio (VALSEA)
              </button>
            </div>

            {inputMode === 'text' ? (
              <textarea
                className="h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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

          {result?.audio_base64 && (
            <audio
              controls
              className="mt-4 w-full"
              src={`data:audio/mpeg;base64,${result.audio_base64}`}
            />
          )}
        </section>

        {showTranscript && (
          <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-medium text-slate-900">Live transcript</h2>
              <p className="text-xs text-slate-500">Caller left · Agent right</p>
            </div>
            <div
              id="live-transcript"
              className="flex max-h-[420px] min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto p-6"
            >
              {messages.length === 0 && (
                <p className="text-center text-sm text-slate-400">
                  Run the agent to start a conversation.
                </p>
              )}
              {messages.map((msg) => {
                if (msg.role === 'system') {
                  return (
                    <p
                      key={msg.id}
                      className="text-center text-xs italic text-slate-400"
                    >
                      {msg.text}
                    </p>
                  );
                }
                const isCaller = msg.role === 'caller';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCaller ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        isCaller
                          ? 'rounded-bl-md bg-slate-100 text-slate-800'
                          : 'rounded-br-md bg-teal-600 text-white'
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-medium uppercase opacity-70">
                        {isCaller ? 'Caller' : 'Agent'}
                      </p>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
