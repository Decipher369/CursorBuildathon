'use client';

import { useState, useEffect } from 'react';
import type { Business } from '@/lib/business-types';
import type { CallRow } from '@/lib/call-stats';
import { maskPhone, formatDuration } from '@/lib/call-stats';
import CallAudioListenButton from '../CallAudioListenButton';
import { useCalls } from '../hooks/useCalls';

// ─── Types ────────────────────────────────────────────────────────────────────

type Session = {
  key: string;           // call_sid or synthetic id
  call_sid: string | null;
  phone_number: string;
  turns: CallRow[];
  started_at: string;
  overall_sentiment: string;
  dominant_intent: string;
  escalated: boolean;
};

type CallerProfile = {
  phone_number: string;
  sessions: Session[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupIntoSessions(calls: CallRow[]): Session[] {
  const sidMap = new Map<string, CallRow[]>();
  const noSidRows: CallRow[] = [];

  for (const call of calls) {
    if (call.call_sid) {
      const bucket = sidMap.get(call.call_sid) ?? [];
      bucket.push(call);
      sidMap.set(call.call_sid, bucket);
    } else {
      noSidRows.push(call);
    }
  }

  const sessions: Session[] = [];

  for (const [sid, turns] of sidMap) {
    const sorted = [...turns].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    sessions.push(buildSession(sid, sorted[0].phone_number, sorted, sid));
  }

  // Simulated / demo calls with no call_sid each become their own session
  for (const row of noSidRows) {
    sessions.push(buildSession(row.id, row.phone_number, [row], null));
  }

  return sessions.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
}

function buildSession(
  key: string,
  phone_number: string,
  turns: CallRow[],
  call_sid: string | null,
): Session {
  const labels = turns.map((t) => t.sentiment_label).filter(Boolean) as string[];
  const negCount = labels.filter((l) => l === 'negative').length;
  const posCount = labels.filter((l) => l === 'positive').length;
  const overall_sentiment =
    negCount > posCount ? 'negative' : posCount > negCount ? 'positive' : 'neutral';

  const intentMap = new Map<string, number>();
  for (const t of turns) {
    const i = t.intent ?? 'unknown';
    intentMap.set(i, (intentMap.get(i) ?? 0) + 1);
  }
  const dominant_intent = [...intentMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

  return {
    key,
    call_sid,
    phone_number,
    turns,
    started_at: turns[0].created_at,
    overall_sentiment,
    dominant_intent,
    escalated: turns.some((t) => t.escalated),
  };
}

function sentimentColors(label: string) {
  if (label === 'positive') return 'bg-emerald-100 text-emerald-800';
  if (label === 'negative') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

function SentimentBadge({ label }: { label?: string }) {
  const normalized = label ?? 'neutral';
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${sentimentColors(normalized)}`}
    >
      {normalized}
    </span>
  );
}

function IntentBadge({ intent }: { intent?: string }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
      {intent ?? 'unknown'}
    </span>
  );
}

// ─── Session list item ────────────────────────────────────────────────────────

function SessionListItem({
  session,
  selected,
  onSelect,
}: {
  session: Session;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-teal-50/60 ${
        selected ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-slate-800">
          {maskPhone(session.phone_number)}
        </span>
        <span className="shrink-0 text-xs text-slate-400">
          {new Date(session.started_at).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <SentimentBadge label={session.overall_sentiment} />
        <IntentBadge intent={session.dominant_intent} />
        {session.escalated && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Escalated
          </span>
        )}
        <span className="text-xs text-slate-400">
          {session.turns.length} {session.turns.length === 1 ? 'turn' : 'turns'}
        </span>
      </div>
    </button>
  );
}

// ─── Chat thread ──────────────────────────────────────────────────────────────

function ChatThread({
  session,
  onCallerClick,
}: {
  session: Session;
  onCallerClick: (phone: string) => void;
}) {
  const lastAgentTurn = [...session.turns].reverse().find((t) => t.audio_base64);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <button
            type="button"
            onClick={() => onCallerClick(session.phone_number)}
            className="font-mono text-sm font-semibold text-teal-700 underline-offset-2 hover:underline"
            title="View caller profile"
          >
            {maskPhone(session.phone_number)}
          </button>
          <p className="text-xs text-slate-400">
            {new Date(session.started_at).toLocaleString()} ·{' '}
            {session.turns.length} {session.turns.length === 1 ? 'turn' : 'turns'}
            {session.call_sid && (
              <span className="ml-2 font-mono text-slate-300">{session.call_sid.slice(0, 16)}…</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <SentimentBadge label={session.overall_sentiment} />
          <IntentBadge intent={session.dominant_intent} />
          {session.escalated && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Escalated
            </span>
          )}
        </div>
      </div>

      {/* Bubbles */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {session.turns.map((turn, idx) => (
          <div key={turn.id} className="space-y-2">
            {turn.transcript && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Caller
                    {idx === 0 && (
                      <span className="ml-2 normal-case text-slate-300">
                        {new Date(turn.created_at).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </p>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
                    {turn.transcript}
                  </div>
                </div>
              </div>
            )}
            {turn.agent_response && (
              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <p className="mb-1 text-right text-xs font-medium uppercase tracking-wide text-teal-400">
                    Agent
                  </p>
                  <div className="rounded-2xl rounded-tr-sm bg-teal-600 px-4 py-2.5 text-sm text-white">
                    {turn.agent_response}
                  </div>
                  {turn.sentiment_label && (
                    <div className="mt-1 flex justify-end">
                      <SentimentBadge label={turn.sentiment_label} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {lastAgentTurn?.audio_base64 && (
        <div className="border-t border-slate-100 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Last agent reply:</span>
            <CallAudioListenButton audio_base64={lastAgentTurn.audio_base64} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Caller profile panel ─────────────────────────────────────────────────────

function CallerProfile({
  profile,
  onSelectSession,
  onClose,
}: {
  profile: CallerProfile;
  onSelectSession: (session: Session) => void;
  onClose: () => void;
}) {
  const totalTurns = profile.sessions.reduce((s, p) => s + p.turns.length, 0);
  const escalatedCount = profile.sessions.filter((s) => s.escalated).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">
            {maskPhone(profile.phone_number)}
          </p>
          <p className="text-xs text-slate-400">
            {profile.sessions.length} sessions · {totalTurns} total turns ·{' '}
            {escalatedCount} escalated
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close profile"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {profile.sessions.map((session) => (
          <button
            key={session.key}
            type="button"
            onClick={() => onSelectSession(session)}
            className="w-full cursor-pointer border-b border-slate-50 px-6 py-3 text-left hover:bg-teal-50/60"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {new Date(session.started_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5">
                <SentimentBadge label={session.overall_sentiment} />
                {session.escalated && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Escalated
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {session.turns.length} {session.turns.length === 1 ? 'turn' : 'turns'} ·{' '}
              {session.dominant_intent}
            </p>
            {session.turns[0]?.transcript && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {session.turns[0].transcript}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function CallLogsView({ business }: { business: Business }) {
  const { calls, loading, error } = useCalls(business.id);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [callerProfile, setCallerProfile] = useState<CallerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSessions(groupIntoSessions(calls));
  }, [calls]);

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.phone_number.toLowerCase().includes(q) ||
      s.dominant_intent.toLowerCase().includes(q) ||
      s.overall_sentiment.toLowerCase().includes(q) ||
      s.turns.some(
        (t) =>
          t.transcript?.toLowerCase().includes(q) ||
          t.agent_response?.toLowerCase().includes(q),
      )
    );
  });

  function openCallerProfile(phone_number: string) {
    const callerSessions = sessions.filter((s) => s.phone_number === phone_number);
    setCallerProfile({ phone_number, sessions: callerSessions });
  }

  function handleSelectSession(session: Session) {
    setSelectedSession(session);
    setCallerProfile(null);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Session list */}
      <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h1 className="text-base font-semibold text-slate-900">Call Logs</h1>
          <p className="text-xs text-slate-400">
            {loading ? 'Loading…' : `${sessions.length} sessions`}
          </p>
          <input
            type="search"
            placeholder="Search calls…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200"
          />
        </div>

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 && !loading && (
            <p className="px-4 py-8 text-center text-xs text-slate-400">
              {searchQuery ? 'No sessions match your search.' : 'No calls yet. Run a simulation from the Dashboard.'}
            </p>
          )}
          {filteredSessions.map((session) => (
            <SessionListItem
              key={session.key}
              session={session}
              selected={selectedSession?.key === session.key}
              onSelect={() => handleSelectSession(session)}
            />
          ))}
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        {callerProfile ? (
          <CallerProfile
            profile={callerProfile}
            onSelectSession={handleSelectSession}
            onClose={() => setCallerProfile(null)}
          />
        ) : selectedSession ? (
          <ChatThread
            session={selectedSession}
            onCallerClick={openCallerProfile}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-2xl">
              💬
            </div>
            <p className="text-sm font-medium text-slate-600">Select a session to view the conversation</p>
            <p className="mt-1 text-xs text-slate-400">
              Each session groups all turns of one phone call
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
