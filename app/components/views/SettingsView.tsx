'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Business } from '@/lib/business-types';
import { IconArrowRight, IconFlask, IconPhone, IconSettings } from '../icons';

const BUSINESS_TYPES = ['restaurant', 'clinic', 'salon', 'retail', 'other'];
const ESCALATION_THRESHOLDS = [
  { value: 'negative', label: 'Negative only' },
  { value: 'neutral_or_worse', label: 'Neutral or worse' },
  { value: 'never', label: 'Never escalate' },
];

const inputCls =
  'w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-teal-500/60 transition-colors';

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
};

function StatRow({ label, value, mono = false, capitalize = false, uppercase = false }: { label: string; value: string; mono?: boolean; capitalize?: boolean; uppercase?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </dt>
      <dd
        className={`text-sm font-semibold text-white ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''} ${uppercase ? 'uppercase' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function SettingsView({
  business,
  onSaved,
}: {
  business: Business;
  onSaved?: (updated: Business) => void;
}) {
  const [voiceWebhook, setVoiceWebhook] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Profile edit state
  const [name, setName] = useState(business.name);
  const [type, setType] = useState(business.type ?? 'restaurant');
  const [hours, setHours] = useState(business.hours ?? '');
  const [twilioPhone, setTwilioPhone] = useState(business.twilio_phone_number ?? '');
  const [escalationThreshold, setEscalationThreshold] = useState(
    business.escalation_threshold ?? 'negative',
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          hours: hours || undefined,
          twilio_phone_number: twilioPhone || undefined,
          escalation_threshold: escalationThreshold,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      onSaved?.(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetch('/api/config/public')
      .then((r) => r.json())
      .then((d) => {
        const base = d.app_url || '';
        setAppUrl(base);
        setVoiceWebhook(base ? `${base}/api/twilio/voice` : '/api/twilio/voice');
      })
      .catch(() => {});
  }, []);

  function copyWebhook() {
    if (!voiceWebhook) return;
    navigator.clipboard.writeText(voiceWebhook).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="px-2 pt-6 pb-8 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-premium relative mb-6 flex items-center gap-4 overflow-hidden p-6"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(186,79,255,0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #582CFF 0%, #BD00FF 100%)',
            boxShadow: '0 8px 24px rgba(88,44,255,0.45)',
          }}
        >
          <IconSettings className="h-6 w-6 text-white" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            Settings
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Integration and account details
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl space-y-4">
        {/* ── Business Profile Edit ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="card-premium p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)' }}
            >
              <IconPhone className="h-4 w-4 text-white" />
            </span>
            <h2 className="text-base font-bold text-white">Business Profile</h2>
          </div>

          <AnimatePresence>
            {saveError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {saveError}
              </motion.div>
            )}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-400"
              >
                ✓ Profile updated.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Business Name
                </label>
                <input className={inputCls} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Business Type
                </label>
                <select className={`${inputCls} appearance-none`} style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Twilio Phone
                </label>
                <input className={`${inputCls} font-mono`} style={inputStyle} value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} placeholder="+6591234567" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Escalation Threshold
                </label>
                <select className={`${inputCls} appearance-none`} style={inputStyle} value={escalationThreshold} onChange={(e) => setEscalationThreshold(e.target.value)}>
                  {ESCALATION_THRESHOLDS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Business Hours
              </label>
              <input className={inputCls} style={inputStyle} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. Mon–Fri 9am–6pm, Sat 10am–4pm" />
            </div>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)',
                boxShadow: '0 8px 24px rgba(79,172,254,0.35)',
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent"
                  />
                  Saving…
                </span>
              ) : 'Save Profile'}
            </motion.button>
          </form>
        </motion.section>

        <div className="grid gap-4 xl:grid-cols-2">
        {/* Business info (read-only) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="card-premium p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)' }}
            >
              <IconPhone className="h-4 w-4 text-white" />
            </span>
            <h2 className="text-base font-bold text-white">Current Values</h2>
          </div>
          <dl className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <StatRow label="Name" value={business.name} />
            <StatRow label="Type" value={business.type} capitalize />
            <StatRow label="Twilio number" value={business.twilio_phone_number ?? '—'} mono />
            <StatRow label="Language" value={business.language ?? 'en'} uppercase />
          </dl>
        </motion.section>

        {/* Twilio webhook */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="card-premium p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}
            >
              <IconArrowRight className="h-4 w-4 text-white" />
            </span>
            <h2 className="text-base font-bold text-white">Twilio voice webhook</h2>
          </div>
          <p className="mb-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Set this URL on your Twilio number under Voice → A call comes in, POST.
          </p>
          <div
            className="group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <code className="break-all font-mono text-xs leading-relaxed text-white">
              {voiceWebhook || '—'}
            </code>
            <button
              type="button"
              onClick={copyWebhook}
              className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.04]"
              style={{
                background: copied
                  ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                  : 'rgba(79,172,254,0.18)',
                border: '1px solid rgba(79,172,254,0.3)',
                color: copied ? '#fff' : '#4facfe',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {appUrl && (
            <p className="mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              App URL: <span className="font-mono text-white/70">{appUrl}</span>
            </p>
          )}
        </motion.section>

        {/* Developer */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="card-premium p-6 xl:col-span-2"
        >
          <div className="mb-4 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #582CFF 0%, #BD00FF 100%)' }}
            >
              <IconFlask className="h-4 w-4 text-white" />
            </span>
            <h2 className="text-base font-bold text-white">Developer</h2>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Simulate calls and view Twilio reference. These tools are not visible on the public business dashboard.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 8px 24px rgba(79,172,254,0.35)',
            }}
          >
            <span>Open Admin Tools</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.section>
        </div>
      </div>
    </div>
  );
}
