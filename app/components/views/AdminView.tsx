'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { Business } from '@/lib/business-types';
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

function PulseDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"
          animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-teal-400' : 'bg-slate-600'}`}
      />
    </span>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'system') {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs italic text-slate-500"
      >
        {msg.text}
      </motion.p>
    );
  }
  const isCaller = msg.role === 'caller';
  return (
    <motion.div
      initial={{ opacity: 0, x: isCaller ? -16 : 16, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isCaller ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isCaller
            ? 'rounded-bl-sm bg-white/[0.08] text-slate-200'
            : 'rounded-br-sm bg-teal-500/80 text-white backdrop-blur-sm'
        }`}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
          {isCaller ? 'Caller' : 'AI Agent'}
        </p>
        {msg.text}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-1 rounded-2xl rounded-br-sm bg-teal-500/40 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminView({ business }: { business: Business }) {
  const { reload } = useCalls(business.id);
  const [processing, setProcessing] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTwilio, setShowTwilio] = useState(false);
  const [voiceWebhook, setVoiceWebhook] = useState('');
  const [phone, setPhone] = useState('+6591234567');
  const [transcript, setTranscript] = useState(
    'Hi, I would like to book a table for four people tomorrow evening.',
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/config/public')
      .then((r) => r.json())
      .then((d) => {
        const base = d.app_url || '';
        setVoiceWebhook(base ? `${base}/api/twilio/voice` : '/api/twilio/voice');
      })
      .catch(() => {});
  }, []);

  const pushMessage = useCallback((role: ChatMessage['role'], text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, text },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const runSimulation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setProcessing(true);
      setRunError(null);
      setResult(null);
      setMessages([]);
      setIsTyping(false);

      const callerText = inputMode === 'text' ? transcript : 'Processing audio with VALSEA…';
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
            body: JSON.stringify({ business_id: business.id, phone_number: phone, transcript }),
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

        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 1200));
        setIsTyping(false);
        pushMessage('agent', data.response);
        setResult(data);
        await reload();
      } catch (e) {
        setIsTyping(false);
        setRunError(e instanceof Error ? e.message : 'Processing failed');
      } finally {
        setProcessing(false);
      }
    },
    [audioFile, business.id, inputMode, phone, pushMessage, reload, transcript],
  );

  return (
    <div className="min-h-full p-6 text-slate-100">
      {/* Hero header with cosmic background */}
      <div
        className="relative mb-8 overflow-hidden rounded-3xl"
        style={{
          minHeight: 180,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/admin-cosmos.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.85,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(6, 11, 40, 0.92) 0%, rgba(6, 11, 40, 0.55) 50%, rgba(6, 11, 40, 0.2) 100%)',
          }}
        />

        <div className="relative flex flex-wrap items-center justify-between gap-4 p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Admin · Pages / Test Agent
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Test &amp; simulate
            </h1>
            <p className="mt-2 max-w-md text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {business.name} <span style={{ color: 'rgba(255,255,255,0.4)' }}>· not shown on the business dashboard</span>
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wider transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
            }}
          >
            ← BACK TO DASHBOARD
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <PulseDot active={processing} />
            <h2 className="font-semibold text-white">Simulate call</h2>
            {processing && (
              <span className="ml-auto text-xs font-medium text-teal-400">Processing…</span>
            )}
          </div>

          <form onSubmit={runSimulation} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Caller number
              </label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm text-white focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              {(['text', 'audio'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    inputMode === mode
                      ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/50'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {mode === 'text' ? 'Text' : 'Audio (VALSEA)'}
                </button>
              ))}
            </div>

            {inputMode === 'text' ? (
              <textarea
                className="h-24 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm text-white focus:border-teal-500/50 focus:outline-none"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                required
              />
            ) : (
              <input
                type="file"
                accept="audio/*"
                className="w-full text-xs text-slate-400"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                required
              />
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-xl bg-teal-500/20 py-2.5 text-sm font-semibold text-teal-300 ring-1 ring-teal-500/40 hover:bg-teal-500/30 disabled:opacity-40"
            >
              {processing ? 'Running agent…' : 'Run agent'}
            </button>
          </form>

          {runError && (
            <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {runError}
            </p>
          )}

          {result?.audio_base64 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-slate-500">Agent audio</p>
              <audio
                controls
                className="w-full"
                src={`data:audio/mpeg;base64,${result.audio_base64}`}
              />
            </div>
          )}

          {result && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2">
                <p className="text-slate-500">Sentiment</p>
                <p className="font-semibold capitalize text-white">{result.sentiment_label}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2">
                <p className="text-slate-500">Intent</p>
                <p className="font-semibold text-white">{result.intent}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2">
                <p className="text-slate-500">Escalated</p>
                <p className="font-semibold text-white">{result.escalated ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="font-semibold text-white">Live transcript</h2>
          </div>
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-5"
            style={{ minHeight: 320, maxHeight: 420 }}
          >
            {messages.length === 0 && !processing ? (
              <p className="text-center text-xs text-slate-600">
                Run a simulation to see the conversation
              </p>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
            {isTyping && <TypingDots />}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.04]">
        <button
          type="button"
          onClick={() => setShowTwilio(!showTwilio)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm text-slate-400"
        >
          Twilio voice webhook reference
          <span>{showTwilio ? '−' : '+'}</span>
        </button>
        {showTwilio && (
          <div className="border-t border-white/[0.06] px-5 pb-4">
            <p className="mb-2 mt-2 text-xs text-slate-500">
              POST (Voice → A call comes in) for {business.twilio_phone_number}:
            </p>
            <code className="block break-all rounded-lg bg-black/30 px-3 py-2 text-xs text-teal-300">
              {voiceWebhook}
            </code>
          </div>
        )}
      </section>
    </div>
  );
}
