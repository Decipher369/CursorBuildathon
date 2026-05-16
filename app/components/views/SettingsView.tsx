'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Business } from '@/lib/business-types';
import { IconArrowRight, IconFlask, IconPhone, IconSettings } from '../icons';

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

export default function SettingsView({ business }: { business: Business }) {
  const [voiceWebhook, setVoiceWebhook] = useState('');
  const [appUrl, setAppUrl] = useState('');
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

      <div className="grid max-w-4xl gap-4 xl:grid-cols-2">
        {/* Business card */}
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
            <h2 className="text-base font-bold text-white">Business</h2>
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
  );
}
