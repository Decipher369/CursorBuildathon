'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { Business } from '@/lib/business-types';
import { parseFaqs, serializeFaqs, type FaqItem } from '@/lib/faqs';

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-colors';

const labelCls = 'mb-1.5 block text-xs font-medium text-slate-400';

export default function AgentView({
  business,
  onSaved,
}: {
  business: Business;
  onSaved: (updated: Business) => void;
}) {
  const [agentName, setAgentName] = useState(business.agent_name ?? 'CallSense Agent');
  const [businessName, setBusinessName] = useState(business.name);
  const [persona, setPersona] = useState(
    business.persona ?? `You are a warm, professional receptionist for ${business.name}.`,
  );
  const [language, setLanguage] = useState(business.language ?? 'en');
  const [faqs, setFaqs] = useState<FaqItem[]>(() => parseFaqs(business.faqs));
  const [escalationPhone, setEscalationPhone] = useState(business.escalation_phone ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateFaq(index: number, field: keyof FaqItem, value: string) {
    setFaqs((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addFaq() {
    setFaqs((items) => [...items, { question: '', answer: '' }]);
  }

  function removeFaq(index: number) {
    setFaqs((items) => items.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      name: businessName,
      language,
      faqs: serializeFaqs(faqs),
      agent_name: agentName,
      persona,
      escalation_phone: escalationPhone || undefined,
    };

    try {
      let res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data = await res.json();

      if (!res.ok && data.message?.includes('agent_name')) {
        const { agent_name: _a, persona: _p, escalation_phone: _e, ...fallback } = payload;
        res = await fetch(`/api/businesses/${business.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallback),
        });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.message || 'Failed to save');
      onSaved(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const fieldDelay = (i: number) => ({ delay: 0.05 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] });

  return (
    <div className="min-h-full bg-slate-950 p-4 sm:p-6 lg:p-8">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">My Agent</h1>
        <p className="mt-0.5 text-sm text-slate-400">Configure how your AI receptionist answers calls.</p>
      </motion.header>

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
            ✓ Agent settings saved successfully.
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="max-w-2xl space-y-5">
        {/* Agent identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(0)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Agent Identity</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Agent Name</label>
              <input className={inputCls} value={agentName} onChange={(e) => setAgentName(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Business Name</label>
              <input className={inputCls} value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Persona</label>
              <textarea
                className={`${inputCls} h-28 resize-none`}
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="Describe how the agent should behave…"
              />
            </div>
          </div>
        </motion.div>

        {/* Language + escalation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(1)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Language & Escalation</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Language</label>
              <select
                className={`${inputCls} appearance-none`}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="zh">Chinese</option>
                <option value="ms">Malay</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Escalation Phone</label>
              <input
                className={`${inputCls} font-mono`}
                value={escalationPhone}
                onChange={(e) => setEscalationPhone(e.target.value)}
                placeholder="+6591234567"
              />
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(2)}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">FAQs</h2>
            <button
              type="button"
              onClick={addFaq}
              className="rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400 ring-1 ring-teal-500/20 hover:bg-teal-500/20 transition-colors"
            >
              + Add FAQ
            </button>
          </div>
          <AnimatePresence initial={false}>
            {faqs.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center text-xs text-slate-600"
              >
                No FAQs yet — add one above.
              </motion.p>
            )}
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
              >
                <input
                  className={`${inputCls} mb-2`}
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                />
                <textarea
                  className={`${inputCls} resize-none`}
                  placeholder="Answer"
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fieldDelay(3)}
        >
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-teal-500/20 py-3 text-sm font-semibold text-teal-300 ring-1 ring-teal-500/40 hover:bg-teal-500/30 disabled:opacity-40 transition-colors sm:w-auto sm:px-8"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-teal-400 border-t-transparent"
                />
                Saving…
              </span>
            ) : (
              'Save Agent Settings'
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
