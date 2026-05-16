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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* Cyan bubble orbs floating in the centre of the page */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Large centre orb */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: '520px', height: '520px',
          top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,210,255,0.13) 0%, rgba(0,180,255,0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'wave-drift 14s ease-in-out infinite',
        }} />
        {/* Upper-left bubble */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: '300px', height: '300px',
          top: '15%', left: '35%',
          background: 'radial-gradient(circle, rgba(0,230,255,0.11) 0%, transparent 65%)',
          filter: 'blur(30px)',
          animation: 'wave-drift 10s ease-in-out infinite reverse',
        }} />
        {/* Lower-right bubble */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: '360px', height: '360px',
          top: '60%', left: '62%',
          background: 'radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 65%)',
          filter: 'blur(35px)',
          animation: 'wave-drift 18s ease-in-out infinite',
        }} />
        {/* Small accent bubble */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: '180px', height: '180px',
          top: '45%', left: '42%',
          background: 'radial-gradient(circle, rgba(80,230,255,0.14) 0%, transparent 60%)',
          filter: 'blur(20px)',
          animation: 'wave-drift 8s ease-in-out infinite reverse',
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
          /* Dark navy base, purple glow pools at the bottom like the reference */
          background: 'linear-gradient(180deg, #0f1535 0%, #0d1130 55%, #0b0e28 100%)',
          borderRight: 'none',
          position: 'relative' as const,
        }}
      >
        {/* Purple glow blob at bottom — matches reference */}
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-20%',
          width: '140%', height: '55%', pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(88,44,255,0.28) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f1535', letterSpacing: '-1px' }}>CS</span>
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '0.04em' }}>
              CALLSENSE
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, height: '1px', margin: '0 20px 4px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Nav section label */}
        <div style={{ position: 'relative', zIndex: 1, padding: '16px 24px 6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          Pages
        </div>

        {/* Nav items */}
        <nav style={{ position: 'relative', zIndex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '10px 12px', borderRadius: '12px',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: '14px', fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active
                    ? 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: active ? '0 4px 14px rgba(79,172,254,0.45)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  <Icon style={{ width: '16px', height: '16px', color: active ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                </span>
                {label}
              </button>
            );
          })}

          {/* Tools section */}
          <div style={{ padding: '16px 12px 6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Tools
          </div>

          {[
            { href: '/metrics', label: 'Metrics',    Icon: IconBarChart },
            { href: '/admin',   label: 'Test Agent', Icon: IconFlask    },
          ].map(({ href, label, Icon }) => (
            <a key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
            }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.07)' }}>
                <Icon style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.5)' }} />
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

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div
          style={{
            position: 'sticky', top: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 24px',
            background: 'linear-gradient(127.09deg, rgba(6,11,40,0.88) 19.41%, rgba(8,16,45,0.82) 76.65%)',
            backdropFilter: 'blur(20px)',
            borderBottom: 'none',
          }}
        >
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Pages / <span style={{ color: '#fff' }}>{VIEW_TITLES[activeView]}</span>
            </p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>{VIEW_TITLES[activeView]}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: '220px' }}>
              <svg style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Type here...</span>
            </div>

            {/* Profile */}
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                {initials}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{business.name.split(' ')[0]}</span>
            </button>

            {/* Settings */}
            <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.5)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

            {/* Notifications */}
            <button style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.5)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#f5576c', boxShadow: '0 0 6px #f5576c' }} />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
