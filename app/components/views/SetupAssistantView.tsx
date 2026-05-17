'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Business } from '@/lib/business-types';

type Answer = { step: number; question: string; answer: string };

type GeneratedProfile = {
  name: string;
  persona: string;
  hours: string;
  faqs: { question: string; answer: string }[];
  agent_name: string;
  escalation_phone: string;
};

const TOTAL_STEPS = 7;

const inputCls =
  'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all duration-200 resize-none';
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 20 : 6,
            height: 6,
            background:
              i + 1 < current
                ? '#43e97b'
                : i + 1 === current
                ? 'linear-gradient(90deg, #4facfe, #00f2fe)'
                : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </div>
  );
}

export default function SetupAssistantView({
  business,
  onSaved,
  onClose,
}: {
  business: Business;
  onSaved: (updated: Business) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<GeneratedProfile | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchQuestion = useCallback(async (s: number) => {
    setLoadingQuestion(true);
    setAnswer('');
    try {
      const res = await fetch(`/api/ai/questionnaire?step=${s}`);
      const data = await res.json();
      setQuestion(data.question ?? '');
    } catch {
      setQuestion('Tell us about your business.');
    } finally {
      setLoadingQuestion(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial questionnaire load
    void fetchQuestion(1);
  }, [fetchQuestion]);

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;

    const newAnswers = [...answers, { step, question, answer: answer.trim() }];
    setAnswers(newAnswers);

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      fetchQuestion(step + 1);
    } else {
      // Generate profile
      setGenerating(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/questionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers, business_type: business.type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generation failed');
        setPreview(data.profile);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate profile');
      } finally {
        setGenerating(false);
      }
    }
  }

  async function handleApply() {
    if (!preview) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preview.name,
          persona: preview.persona,
          hours: preview.hours,
          faqs: JSON.stringify(preview.faqs),
          agent_name: preview.agent_name,
          escalation_phone: preview.escalation_phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      onSaved(data);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to apply profile');
    } finally {
      setApplying(false);
    }
  }

  // ─── Done state ───────────────────────────────────────────────────────────

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-12 text-center"
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
          style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', boxShadow: '0 12px 32px rgba(67,233,123,0.4)' }}
        >
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">Your agent is ready!</h2>
        <p className="max-w-xs text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          The AI-generated profile has been applied. Your receptionist will now answer calls with this personality and knowledge.
        </p>
        <button
          onClick={onClose}
          className="mt-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 8px 24px rgba(79,172,254,0.4)' }}
        >
          Back to Agent Settings
        </button>
      </motion.div>
    );
  }

  // ─── Preview state ─────────────────────────────────────────────────────────

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-base"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)', boxShadow: '0 8px 20px rgba(79,172,254,0.4)' }}
          >
            ✨
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI-Generated Profile</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Review and apply to your agent
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(245,87,108,0.12)', border: '1px solid rgba(245,87,108,0.3)', color: '#f5576c' }}>
            {error}
          </div>
        )}

        <div className="space-y-3">
          {[
            { label: 'Business Name', value: preview.name },
            { label: 'Agent Name', value: preview.agent_name },
            { label: 'Hours', value: preview.hours },
            { label: 'Escalation Phone', value: preview.escalation_phone || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
              <p className="text-sm text-white">{value}</p>
            </div>
          ))}

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>Persona</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{preview.persona}</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>FAQs ({preview.faqs.length})</p>
            <div className="space-y-2">
              {preview.faqs.map((faq, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-white">Q: {faq.question}</p>
                  <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>A: {faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{ background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 8px 24px rgba(79,172,254,0.4)' }}
          >
            {applying ? 'Applying…' : 'Apply to My Agent'}
          </button>
          <button
            onClick={() => { setPreview(null); setStep(1); setAnswers([]); fetchQuestion(1); }}
            className="rounded-xl px-4 py-3 text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            Start Over
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Generating state ──────────────────────────────────────────────────────

  if (generating) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full"
          style={{ border: '3px solid rgba(79,172,254,0.2)', borderTopColor: '#4facfe' }}
        />
        <p className="text-sm font-semibold text-white">Generating your agent profile…</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>GPT-4o is crafting your personalized business assistant</p>
      </div>
    );
  }

  // ─── Questionnaire ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-base"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)', boxShadow: '0 8px 20px rgba(79,172,254,0.4)' }}
          >
            🎙️
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Setup Assistant</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>
        </div>
        <StepDots current={step} total={TOTAL_STEPS} />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(245,87,108,0.12)', border: '1px solid rgba(245,87,108,0.3)', color: '#f5576c' }}>
          {error}
        </div>
      )}

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {loadingQuestion ? (
            <div className="flex items-center gap-2 py-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full"
                style={{ border: '2px solid rgba(79,172,254,0.3)', borderTopColor: '#4facfe' }}
              />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading question…</span>
            </div>
          ) : (
            <form onSubmit={handleNext} className="space-y-4">
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)' }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(79,172,254,0.8)' }}>
                    Question {step}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white">{question}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Your Answer
                </label>
                <textarea
                  ref={textareaRef}
                  className={`${inputCls} h-28`}
                  style={inputStyle}
                  placeholder="Type your answer here…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onFocus={(e) =>
                    Object.assign(e.target.style, {
                      borderColor: 'rgba(79,172,254,0.6)',
                      boxShadow: '0 0 0 3px rgba(79,172,254,0.15)',
                    })
                  }
                  onBlur={(e) =>
                    Object.assign(e.target.style, {
                      borderColor: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none',
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 8px 24px rgba(79,172,254,0.4)' }}
                >
                  {step < TOTAL_STEPS ? 'Next →' : 'Generate My Agent ✨'}
                </button>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const prev = step - 1;
                      setAnswers((a) => a.filter((x) => x.step !== step - 1));
                      setStep(prev);
                      fetchQuestion(prev);
                    }}
                    className="rounded-xl px-4 py-3 text-xs font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    ← Back
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Previous answers */}
      {answers.length > 0 && (
        <div className="space-y-2 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Answered
          </p>
          {answers.map((a) => (
            <div key={a.step} className="rounded-xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Q{a.step}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{a.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
