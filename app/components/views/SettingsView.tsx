'use client';

import { useEffect, useState } from 'react';
import type { Business } from '@/lib/business-types';

export default function SettingsView({ business }: { business: Business }) {
  const [voiceWebhook, setVoiceWebhook] = useState('');
  const [appUrl, setAppUrl] = useState('');

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

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">Integration and account details</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-slate-900">Business</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{business.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Type</dt>
              <dd className="capitalize text-slate-900">{business.type}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Twilio number</dt>
              <dd className="font-mono text-slate-900">
                {business.twilio_phone_number ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Language</dt>
              <dd className="uppercase text-slate-900">{business.language ?? 'en'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-slate-900">Twilio voice webhook</h2>
          <p className="mb-2 text-xs text-slate-500">
            Set this URL on your Twilio number (Voice → A call comes in, POST).
          </p>
          <code className="block break-all rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-800">
            {voiceWebhook}
          </code>
          {appUrl && (
            <p className="mt-3 text-xs text-slate-500">App URL: {appUrl}</p>
          )}
        </section>
      </div>
    </div>
  );
}
