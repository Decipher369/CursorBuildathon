'use client';

import type { AppView, Business } from '@/lib/business-types';
import {
  IconAgent,
  IconBarChart,
  IconCallLogs,
  IconDashboard,
  IconFlask,
  IconHeadphones,
  IconSettings,
} from './icons';

const nav: { id: AppView; label: string; Icon: typeof IconDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'agent', label: 'My Agent', Icon: IconAgent },
  { id: 'call-logs', label: 'Call Logs', Icon: IconCallLogs },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
];

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Dashboard',
  agent: 'My Agent',
  'call-logs': 'Call Logs',
  settings: 'Settings',
};

export default function AppShell({
  business,
  activeView,
  onNavigate,
  children,
}: {
  business: Business;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}) {
  const initials = business.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', position: 'relative', background: 'transparent' }}>
      {/* Light blue glow — massive, bright, spread across the whole page */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Full-page royal blue base wash */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 160% 120% at 50% 50%, rgba(45,53,197,0.55) 0%, rgba(35,42,180,0.3) 45%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'wave-drift 18s ease-in-out infinite',
        }} />
        {/* Bright vivid centre hotspot */}
        <div style={{
          position: 'absolute',
          width: '60vw', height: '60vw',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(65,75,220,0.7) 0%, rgba(50,60,210,0.45) 25%, rgba(40,50,200,0.2) 50%, transparent 68%)',
          filter: 'blur(22px)',
          animation: 'wave-drift 11s ease-in-out infinite reverse',
        }} />
        {/* Upper spread */}
        <div style={{
          position: 'absolute',
          width: '90vw', height: '70vw',
          top: '-20%', left: '10%',
          background: 'radial-gradient(circle, rgba(50,60,210,0.45) 0%, transparent 60%)',
          filter: 'blur(50px)',
          animation: 'wave-drift 14s ease-in-out infinite',
        }} />
        {/* Lower spread */}
        <div style={{
          position: 'absolute',
          width: '90vw', height: '70vw',
          top: '55%', left: '15%',
          background: 'radial-gradient(circle, rgba(45,55,205,0.4) 0%, transparent 60%)',
          filter: 'blur(50px)',
          animation: 'wave-drift 21s ease-in-out infinite reverse',
        }} />
        {/* Right fill */}
        <div style={{
          position: 'absolute',
          width: '60vw', height: '80vw',
          top: '10%', right: '-10%',
          background: 'radial-gradient(circle, rgba(50,60,210,0.38) 0%, transparent 60%)',
          filter: 'blur(55px)',
          animation: 'wave-drift 16s ease-in-out infinite',
        }} />
      </div>

      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          borderRight: 'none',
          position: 'relative' as const,
        }}
      >
        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0a10a0' }}>CS</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', letterSpacing: '0.12em' }}>
              CALLSENSE
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, height: '1px', margin: '0 20px 6px', background: 'transparent' }} />

        {/* PAGES label */}
        <div style={{ position: 'relative', zIndex: 1, padding: '14px 24px 6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          Pages
        </div>

        {/* Nav items */}
        <nav style={{ position: 'relative', zIndex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  width: '100%', padding: '11px 14px', borderRadius: '14px',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: '14px', fontWeight: active ? 700 : 500,
                  color: '#fff',
                  background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active
                    ? 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: active ? '0 4px 14px rgba(79,172,254,0.5)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  <Icon style={{ width: '16px', height: '16px', color: active ? '#fff' : 'rgba(255,255,255,0.6)' }} />
                </span>
                <span style={{ opacity: active ? 1 : 0.7 }}>{label}</span>
              </button>
            );
          })}

          {/* TOOLS label */}
          <div style={{ padding: '18px 14px 6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            Tools
          </div>

          {[
            { href: '/metrics', label: 'Metrics',    Icon: IconBarChart },
            { href: '/admin',   label: 'Test Agent', Icon: IconFlask    },
          ].map(({ href, label, Icon }) => (
            <a key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 14px',
              borderRadius: '14px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              color: 'rgba(255,255,255,0.7)', transition: 'background 0.2s',
            }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }}>
                <Icon style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)' }} />
              </span>
              {label}
            </a>
          ))}
        </nav>

        {/* Promo card — bottom */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Promo card — fluid blue wave, matches Vision UI reference */}
          <div style={{
            borderRadius: '20px', padding: '18px', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(160deg, #1a237e 0%, #283593 20%, #1565c0 45%, #0288d1 65%, #4a148c 100%)',
            boxShadow: '0 16px 40px rgba(30,50,200,0.5)',
          }}>
            {/* Bright liquid wave highlight — upper right */}
            <div style={{
              position: 'absolute', top: '-30%', right: '-15%',
              width: '75%', height: '75%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(100,180,255,0.55) 0%, rgba(80,140,255,0.25) 45%, transparent 70%)',
              filter: 'blur(18px)',
            }} />
            {/* Secondary wave — lower left */}
            <div style={{
              position: 'absolute', bottom: '-20%', left: '-10%',
              width: '60%', height: '60%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(140,100,255,0.4) 0%, transparent 65%)',
              filter: 'blur(14px)',
            }} />
            {/* Mid wave streak */}
            <div style={{
              position: 'absolute', top: '30%', left: '20%',
              width: '70%', height: '40%',
              background: 'radial-gradient(ellipse 100% 60% at 50% 50%, rgba(160,210,255,0.2) 0%, transparent 70%)',
              filter: 'blur(10px)',
              transform: 'rotate(-15deg)',
            }} />

            <div style={{ position: 'relative' }}>
              {/* White star badge — matches reference */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', marginBottom: '12px',
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#4facfe' }} viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 3px' }}>Need help?</p>
              <p style={{ color: 'rgba(200,220,255,0.85)', fontSize: '11px', margin: '0 0 14px' }}>Please check our docs</p>
              <a
                href="https://github.com/Decipher369/CursorBuildathon"
                target="_blank" rel="noopener"
                style={{
                  display: 'block', textAlign: 'center', padding: '10px 0',
                  borderRadius: '10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                  color: '#fff', textDecoration: 'none',
                  background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)',
                }}
              >
                DOCUMENTATION
              </a>
            </div>
          </div>

          {/* Cyan pill button — "Upgrade to PRO" style */}
          <a href="/admin" style={{
            display: 'block', textAlign: 'center', padding: '12px 0',
            borderRadius: '50px', fontSize: '13px', fontWeight: 700,
            color: '#fff', textDecoration: 'none',
            background: 'linear-gradient(90deg, #00d2ff 0%, #00b4d8 50%, #0096c7 100%)',
            boxShadow: '0 8px 28px rgba(0,180,230,0.5)',
          }}>
            TEST AGENT
          </a>
        </div>
      </aside>

      {/* Main content — scrolls independently, sidebar stays fixed */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: 'transparent' }}>
        {/* Floating top bar — stays at top while content scrolls */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '12px 16px 0' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, rgba(6,8,24,0.75) 0%, rgba(8,13,40,0.65) 50%, rgba(12,21,80,0.6) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05) inset',
            }}
          >
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Home icon */}
              <svg style={{ width: '11px', height: '11px', color: 'rgba(255,255,255,0.45)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{VIEW_TITLES[activeView]}</span>
            </p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>{VIEW_TITLES[activeView]}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', width: '200px' }}>
              <svg style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Type here...</span>
            </div>

            {/* Sign in / profile */}
            <button style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: 'none', cursor: 'pointer' }}>
              <svg style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.7)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{business.name.split(' ')[0]}</span>
            </button>

            {/* Settings */}
            <button style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.6)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

            {/* Notifications */}
            <button style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.6)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '7px', height: '7px', borderRadius: '50%', background: '#f5576c' }} />
            </button>
          </div>
          </div>{/* end glass pill */}
        </div>{/* end sticky wrapper */}

        {/* Page content */}
        <div style={{ flex: 1, padding: '24px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
