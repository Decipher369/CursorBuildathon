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

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-teal-600 dark:text-teal-400">
          CallSense
        </p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Set up your business
        </h1>
        <p className="mb-8 text-sm text-zinc-500">
          One business for MVP. Link your Twilio number so inbound calls route
          correctly.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Business name
            </label>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Laksa House"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Type
              </label>
              <select
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="restaurant">Restaurant</option>
                <option value="clinic">Clinic</option>
                <option value="salon">Salon</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Language
              </label>
              <select
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="zh">Chinese</option>
                <option value="ms">Malay</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Twilio phone number (E.164)
            </label>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={twilioPhone}
              onChange={(e) => setTwilioPhone(e.target.value)}
              placeholder="+6591234567"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">
              Pre-filled from TWILIO_PHONE_NUMBER when set on the server.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Hours
            </label>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              FAQs (for the agent)
            </label>
            <textarea
              className="h-24 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={faqs}
              onChange={(e) => setFaqs(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Escalate when sentiment is
            </label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(e.target.value)}
            >
              <option value="negative">Negative</option>
              <option value="neutral">Neutral or worse</option>
              <option value="never">Never (demo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create business'}
          </button>
        </form>
      </div>
    </div>
  );
}