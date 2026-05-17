'use client';

import { useState, useMemo } from 'react';
import type { Business } from '@/lib/business-types';
import type { CallRow } from '@/lib/call-stats';
import { maskPhone } from '@/lib/call-stats';
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
  if (label === 'positive') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  if (label === 'negative') return 'bg-red-500/20 text-red-300 border border-red-500/30';
  return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
}

function SentimentBadge({ label }: { label?: string }) {
  const normalized = label ?? 'neutral';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${sentimentColors(normalized)}`}>
      {normalized}
    </span>
  );
}

function IntentBadge({ intent }: { intent?: string }) {
  return (
    <span className="inline-block rounded-full bg-white/[0.08] border border-white/10 px-2 py-0.5 text-xs font-medium capitalize text-slate-300">
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
      className={`w-full cursor-pointer px-4 py-3 text-left transition-colors ${
        selected
          ? 'bg-[#4facfe]/10 border-l-2 border-l-[#4facfe]'
          : 'border-b border-white/[0.06] hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-white">
          {maskPhone(session.phone_number)}
        </span>
        <span className="shrink-0 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-300">
            Escalated
          </span>
        )}
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <button
            type="button"
            onClick={() => onCallerClick(session.phone_number)}
            className="font-mono text-sm font-semibold text-[#4facfe] underline-offset-2 hover:underline"
            title="View caller profile"
          >
            {maskPhone(session.phone_number)}
          </button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {new Date(session.started_at).toLocaleString()} ·{' '}
            {session.turns.length} {session.turns.length === 1 ? 'turn' : 'turns'}
            {session.call_sid && (
              <span className="ml-2 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{session.call_sid.slice(0, 16)}…</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <SentimentBadge label={session.overall_sentiment} />
          <IntentBadge intent={session.dominant_intent} />
          {session.escalated && (
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-300">
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
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Caller
                    {idx === 0 && (
                      <span className="ml-2 normal-case" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {new Date(turn.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                  <div className="rounded-2xl rounded-tl-sm bg-white/[0.08] px-4 py-2.5 text-sm text-slate-200">
                    {turn.transcript}
                  </div>
                </div>
              </div>
            )}
            {turn.agent_response && (
              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <p className="mb-1 text-right text-xs font-medium uppercase tracking-wide text-[#4facfe]">
                    Agent
                  </p>
                  <div className="rounded-2xl rounded-tr-sm bg-[#4facfe]/80 px-4 py-2.5 text-sm text-white backdrop-blur-sm">
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
        <div className="px-6 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Last agent reply:</span>
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
      <div className="flex items-start justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <p className="font-mono text-sm font-semibold text-white">
            {maskPhone(profile.phone_number)}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {profile.sessions.length} sessions · {totalTurns} total turns ·{' '}
            {escalatedCount} escalated
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
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
            className="w-full cursor-pointer px-6 py-3 text-left hover:bg-white/[0.04] transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {new Date(session.started_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5">
                <SentimentBadge label={session.overall_sentiment} />
                {session.escalated && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-300">
                    Escalated
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {session.turns.length} {session.turns.length === 1 ? 'turn' : 'turns'} ·{' '}
              {session.dominant_intent}
            </p>
            {session.turns[0]?.transcript && (
              <p className="mt-0.5 truncate text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
  const sessions = useMemo(() => groupIntoSessions(calls), [calls]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [callerProfile, setCallerProfile] = useState<CallerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Session list */}
      <aside className="flex w-80 shrink-0 flex-col" style={{ background: 'rgba(8,12,32,0.6)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-base font-semibold text-white">Call Logs</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {loading ? 'Loading…' : `${sessions.length} sessions`}
          </p>
          <input
            type="search"
            placeholder="Search calls…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#4facfe]/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 && !loading && (
            <p className="px-4 py-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
      <main className="flex flex-1 flex-col overflow-hidden" style={{ background: 'rgba(10,16,40,0.5)' }}>
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
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#4facfe]/15 text-2xl">
              💬
            </div>
            <p className="text-sm font-medium text-white">Select a session to view the conversation</p>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Each session groups all turns of one phone call
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
