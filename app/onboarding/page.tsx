'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('restaurant');
  const [language, setLanguage] = useState('en');
  const [hours, setHours] = useState('Mon–Sun 11am–10pm');
  const [faqs, setFaqs] = useState(
    'Q: Do you take reservations?\nA: Yes, for parties of 2 or more.',
  );
  const [escalationThreshold, setEscalationThreshold] = useState('negative');
  const [twilioPhone, setTwilioPhone] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [bizRes, configRes] = await Promise.all([
          fetch('/api/businesses'),
          fetch('/api/config/public'),
        ]);
        const businesses = await bizRes.json();
        if (bizRes.ok && Array.isArray(businesses) && businesses.length > 0) {
          router.replace('/dashboard');
          return;
        }
        const config = await configRes.json();
        if (config.twilio_phone_number) {
          setTwilioPhone(config.twilio_phone_number);
        }
      } catch {
        /* allow form anyway */
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          language,
          hours,
          faqs,
          escalation_threshold: escalationThreshold,
          twilio_phone_number: twilioPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create business');

      router.refresh();
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldCls = 'w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#4facfe]/60 transition-all';
  const fieldStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
  const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-widest';
  const labelStyle = { color: 'rgba(255,255,255,0.55)' };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0a1430' }}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-[#4facfe] border-t-transparent animate-spin" />
          <p className="text-sm text-white/50">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a1430' }}>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
          style={{ width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(79,172,254,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #007bff 100%)' }}>
              CS
            </span>
            <span className="text-lg font-bold tracking-tight">CallSense</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4facfe] mb-1">Setup</p>
          <h1 className="text-2xl font-bold tracking-tight">Set up your business</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Link your Twilio number so inbound calls route to your AI agent correctly.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(12,16,42,0.82)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
          <div>
            <label className={labelCls} style={labelStyle}>Business name</label>
            <input className={fieldCls} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Laksa House" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Type</label>
              <select className={`${fieldCls} appearance-none`} style={fieldStyle} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="restaurant" style={{ background: '#0d1440' }}>Restaurant</option>
                <option value="clinic" style={{ background: '#0d1440' }}>Clinic</option>
                <option value="salon" style={{ background: '#0d1440' }}>Salon</option>
                <option value="retail" style={{ background: '#0d1440' }}>Retail</option>
                <option value="other" style={{ background: '#0d1440' }}>Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Language</label>
              <select className={`${fieldCls} appearance-none`} style={fieldStyle} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en" style={{ background: '#0d1440' }}>English</option>
                <option value="zh" style={{ background: '#0d1440' }}>Chinese</option>
                <option value="ms" style={{ background: '#0d1440' }}>Malay</option>
                <option value="ta" style={{ background: '#0d1440' }}>Tamil</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Twilio phone number (E.164)</label>
            <input className={`${fieldCls} font-mono`} style={fieldStyle} value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} placeholder="+6591234567" required />
            <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Pre-filled from TWILIO_PHONE_NUMBER when set on the server.
            </p>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Hours</label>
            <input className={fieldCls} style={fieldStyle} value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>FAQs (for the agent)</label>
            <textarea className={`${fieldCls} h-24 resize-none leading-relaxed`} style={fieldStyle} value={faqs} onChange={(e) => setFaqs(e.target.value)} />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Escalate when sentiment is</label>
            <select className={`${fieldCls} appearance-none`} style={fieldStyle} value={escalationThreshold} onChange={(e) => setEscalationThreshold(e.target.value)}>
              <option value="negative" style={{ background: '#0d1440' }}>Negative</option>
              <option value="neutral" style={{ background: '#0d1440' }}>Neutral or worse</option>
              <option value="never" style={{ background: '#0d1440' }}>Never (demo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-3 text-sm font-bold text-[#060818] transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)', boxShadow: '0 8px 24px rgba(79,172,254,0.35)' }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Creating…
              </span>
            ) : 'Create Business →'}
          </button>
        </form>
      </div>
    </div>
  );
}