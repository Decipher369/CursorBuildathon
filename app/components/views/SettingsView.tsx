'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Business } from '@/lib/business-types';

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-colors';
const labelCls = 'mb-1.5 block text-xs font-medium text-slate-400';

const BUSINESS_TYPES = ['restaurant', 'clinic', 'salon', 'retail', 'other'];
const ESCALATION_THRESHOLDS = [
  { value: 'negative', label: 'Negative only' },
  { value: 'neutral_or_worse', label: 'Neutral or worse' },
  { value: 'never', label: 'Never escalate' },
];

export default function SettingsView({
  business,
  onSaved,
}: {
  business: Business;
  onSaved?: (updated: Business) => void;
}) {
  const [voiceWebhook, setVoiceWebhook] = useState('');
  const [appUrl, setAppUrl] = useState('');

  // Profile form state
  const [name, setName] = useState(business.name);
  const [type, setType] = useState(business.type ?? 'restaurant');
  const [hours, setHours] = useState(business.hours ?? '');
  const [twilioPhone, setTwilioPhone] = useState(business.twilio_phone_number ?? '');
  const [escalationThreshold, setEscalationThreshold] = useState(
    business.escalation_threshold ?? 'negative',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText(voiceWebhook).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fieldDelay = (i: number) => ({
    delay: 0.05 + i * 0.06,
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  });

  return (
    <div className="min-h-full bg-slate-950 p-4 sm:p-6 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-400">Business profile and integration details</p>
      </motion.header>

      <div className="max-w-2xl space-y-5">
        {/* ── Business Profile Edit ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(0)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Business Profile</h2>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-400"
              >
                ✓ Business profile updated.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Business Name</label>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Business Type</label>
                <select
                  className={`${inputCls} appearance-none capitalize`}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Twilio Phone Number</label>
                <input
                  className={`${inputCls} font-mono`}
                  value={twilioPhone}
                  onChange={(e) => setTwilioPhone(e.target.value)}
                  placeholder="+6591234567"
                />
              </div>
              <div>
                <label className={labelCls}>Escalation Threshold</label>
                <select
                  className={`${inputCls} appearance-none`}
                  value={escalationThreshold}
                  onChange={(e) => setEscalationThreshold(e.target.value)}
                >
                  {ESCALATION_THRESHOLDS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-900">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Business Hours</label>
              <input
                className={inputCls}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. Mon–Fri 9am–6pm, Sat 10am–4pm"
              />
            </div>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-teal-500/20 px-6 py-2.5 text-sm font-semibold text-teal-300 ring-1 ring-teal-500/40 hover:bg-teal-500/30 disabled:opacity-40 transition-colors"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-teal-400 border-t-transparent"
                  />
                  Saving…
                </span>
              ) : (
                'Save Profile'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* ── Twilio Webhook ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(1)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <h2 className="mb-2 text-sm font-semibold text-slate-300">Twilio Voice Webhook</h2>
          <p className="mb-3 text-xs text-slate-500">
            Set this URL on your Twilio number → Voice → A call comes in → HTTP POST.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-xs text-teal-400">
              {voiceWebhook || '/api/twilio/voice'}
            </code>
            <button
              type="button"
              onClick={copyWebhook}
              className="shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {appUrl && (
            <p className="mt-2 text-xs text-slate-600">App URL: {appUrl}</p>
          )}
        </motion.div>

        {/* ── Integration info ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(2)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Business ID</h2>
          <code className="block rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-xs text-slate-400">
            {business.id}
          </code>
          <p className="mt-2 text-xs text-slate-600">Use this ID when calling the API directly.</p>
        </motion.div>
      </div>
    </div>
  );
}
