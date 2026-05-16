'use client';

import { useState } from 'react';
import type { Business } from '@/lib/business-types';
import { parseFaqs, serializeFaqs, type FaqItem } from '@/lib/faqs';

export default function AgentView({
  business,
  onSaved,
}: {
  business: Business;
  onSaved: (updated: Business) => void;
}) {
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
        const { agent_name: _a, persona: _p, escalation_phone: _e, ...fallback } =
          payload;
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
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          My Agent
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure how your AI receptionist answers calls.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Agent settings saved.
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Agent Name
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Business Name
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Persona
          </label>
          <textarea
            className="h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Language
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">FAQs</label>
            <button
              type="button"
              onClick={addFaq}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              + Add FAQ
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3"
              >
                <input
                  className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                />
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Answer"
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                />
                {faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Escalation Phone
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={escalationPhone}
            onChange={(e) => setEscalationPhone(e.target.value)}
            placeholder="+6591234567"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
