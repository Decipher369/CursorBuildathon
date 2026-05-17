'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Business } from '@/lib/business-types';
import { parseFaqs, serializeFaqs, type FaqItem } from '@/lib/faqs';
import { IconAgent, IconAlert, IconCheckCircle } from '../icons';
import SetupAssistantView from './SetupAssistantView';

const FIELD_BASE =
  'w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 transition-all duration-200 focus:outline-none';

const FIELD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const LABEL_CLASS =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-widest';

const LABEL_STYLE: React.CSSProperties = { color: 'rgba(255,255,255,0.55)' };

export default function AgentView({
  business,
  onSaved,
}: {
  business: Business;
  onSaved: (updated: Business) => void;
}) {
  const [showAssistant, setShowAssistant] = useState(false);
  const [agentName, setAgentName] = useState(
    business.agent_name ?? 'CallSense Agent',
  );
  const [businessName, setBusinessName] = useState(business.name);
  const [persona, setPersona] = useState(
    business.persona ??
      `You are a warm, professional receptionist for ${business.name}.`,
  );
  const [language, setLanguage] = useState(business.language ?? 'en');
  const [faqs, setFaqs] = useState<FaqItem[]>(() => parseFaqs(business.faqs));
  const [escalationPhone, setEscalationPhone] = useState(
    business.escalation_phone ?? '',
  );
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
        const fallback = { ...payload };
        delete fallback.agent_name;
        delete fallback.persona;
        delete fallback.escalation_phone;
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-2 pt-6 pb-8 text-white">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-premium relative mb-4 flex items-center gap-4 overflow-hidden p-6"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79,172,254,0.18) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
            boxShadow: '0 8px 24px rgba(79,172,254,0.45)',
          }}
        >
          <IconAgent className="h-6 w-6 text-white" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
            My Agent
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Configure how your AI receptionist answers calls.
          </p>
        </div>
      </motion.div>

      {/* AI Setup Assistant banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mb-4 max-w-3xl"
      >
        <button
          type="button"
          onClick={() => setShowAssistant((v) => !v)}
          className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all hover:scale-[1.005]"
          style={{
            background: showAssistant
              ? 'rgba(79,172,254,0.1)'
              : 'rgba(79,172,254,0.06)',
            border: `1px solid ${showAssistant ? 'rgba(79,172,254,0.4)' : 'rgba(79,172,254,0.18)'}`,
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)', boxShadow: '0 6px 16px rgba(79,172,254,0.4)' }}
          >
            ✨
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">AI Setup Assistant</p>
            <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Answer a few questions and let GPT-4o build your agent profile automatically
            </p>
          </div>
          <svg
            className="h-4 w-4 shrink-0 transition-transform duration-300"
            style={{ color: 'rgba(79,172,254,0.8)', transform: showAssistant ? 'rotate(180deg)' : 'none' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <AnimatePresence>
          {showAssistant && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <SetupAssistantView
                  business={business}
                  onSaved={(updated) => {
                    onSaved(updated);
                    setShowAssistant(false);
                  }}
                  onClose={() => setShowAssistant(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status banners */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(245,87,108,0.12)',
            border: '1px solid rgba(245,87,108,0.3)',
            color: '#f5576c',
          }}
        >
          <IconAlert className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(67,233,123,0.12)',
            border: '1px solid rgba(67,233,123,0.3)',
            color: '#43e97b',
          }}
        >
          <IconCheckCircle className="h-4 w-4" />
          <span>Agent settings saved.</span>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        onSubmit={handleSave}
        className="card-premium max-w-3xl space-y-5 p-7"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} style={LABEL_STYLE}>
              Agent Name
            </label>
            <input
              className={FIELD_BASE}
              style={FIELD_STYLE}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={LABEL_CLASS} style={LABEL_STYLE}>
              Business Name
            </label>
            <input
              className={FIELD_BASE}
              style={FIELD_STYLE}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} style={LABEL_STYLE}>
            Persona
          </label>
          <textarea
            className={`${FIELD_BASE} h-32 resize-none leading-relaxed`}
            style={FIELD_STYLE}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          />
          <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            How your agent should sound — tone, role, attitude.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} style={LABEL_STYLE}>
              Language
            </label>
            <select
              className={FIELD_BASE}
              style={{
                ...FIELD_STYLE,
                appearance: 'none',
                backgroundImage:
                  'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff80\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en" style={{ background: '#0d1440' }}>English</option>
              <option value="zh" style={{ background: '#0d1440' }}>Chinese</option>
              <option value="ms" style={{ background: '#0d1440' }}>Malay</option>
              <option value="ta" style={{ background: '#0d1440' }}>Tamil</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} style={LABEL_STYLE}>
              Escalation Phone
            </label>
            <input
              className={`${FIELD_BASE} font-mono`}
              style={FIELD_STYLE}
              value={escalationPhone}
              onChange={(e) => setEscalationPhone(e.target.value)}
              placeholder="+6591234567"
            />
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <label className={LABEL_CLASS + ' mb-0'} style={LABEL_STYLE}>
              FAQs
            </label>
            <button
              type="button"
              onClick={addFaq}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-all hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79,172,254,0.35)',
              }}
            >
              + Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <input
                  className={`${FIELD_BASE} mb-2`}
                  style={FIELD_STYLE}
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                />
                <textarea
                  className={`${FIELD_BASE} h-20 resize-none`}
                  style={FIELD_STYLE}
                  placeholder="Answer"
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                />
                {faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="mt-2 text-[11px] font-medium transition-colors hover:underline"
                    style={{ color: '#f5576c' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 8px 24px rgba(79,172,254,0.4)',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Updates apply to new calls instantly.
          </p>
        </div>
      </motion.form>

      {/* Focus ring style for inputs */}
      <style jsx global>{`
        .card-premium input:focus,
        .card-premium textarea:focus,
        .card-premium select:focus {
          border-color: rgba(79, 172, 254, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.18);
          background: rgba(255, 255, 255, 0.06) !important;
        }
      `}</style>
    </div>
  );
}
