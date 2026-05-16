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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
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
          background: 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.91) 76.65%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)',
                boxShadow: '0 8px 24px rgba(79,172,254,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              CS
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>CallSense</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>AI Voice Platform</div>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', margin: '0 20px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

        {/* Nav section label */}
        <div style={{ padding: '20px 24px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          Pages
        </div>

        {/* Nav items */}
        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  background: active
                    ? 'linear-gradient(127deg, rgba(6,11,40,0.94) 28%, rgba(10,14,35,0.49) 91%)'
                    : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: active
                      ? 'linear-gradient(135deg, #4facfe 0%, #00c6fb 100%)'
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: active ? '0 4px 12px rgba(79,172,254,0.4)' : 'none',
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', color: active ? '#fff' : 'rgba(255,255,255,0.55)' }} />
                </span>
                {label}
              </button>
            );
          })}

          {/* Tools section */}
          <div style={{ padding: '16px 12px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Tools
          </div>

          <a
            href="/metrics"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              color: 'rgba(255,255,255,0.55)', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }}>
              <IconBarChart style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.65)' }} />
            </span>
            Metrics
          </a>

          <a
            href="/admin"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              color: 'rgba(255,255,255,0.55)', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }}>
              <IconFlask style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.65)' }} />
            </span>
            Test Agent
          </a>
        </nav>

        {/* Promo card — bottom */}
        <div style={{ marginTop: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              borderRadius: '16px',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(88,44,255,0.35)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/promo-waves.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(20,8,50,0.5) 0%, rgba(15,6,40,0.75) 100%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <IconHeadphones style={{ width: '16px', height: '16px', color: '#fff' }} />
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>Need help?</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', margin: '0 0 10px' }}>Please check our docs</p>
              <a
                href="https://github.com/Decipher369/CursorBuildathon"
                target="_blank"
                rel="noopener"
                style={{
                  display: 'block', width: '100%', textAlign: 'center', padding: '8px 0',
                  borderRadius: '10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                  color: '#fff', textDecoration: 'none',
                  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                DOCUMENTATION
              </a>
            </div>
          </div>

          <a
            href="/admin"
            style={{
              display: 'block', textAlign: 'center', padding: '10px 0',
              borderRadius: '12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(310deg, #4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 8px 24px rgba(79,172,254,0.4)',
            }}
          >
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
            background: 'linear-gradient(127.09deg, rgba(6,11,40,0.85) 19.41%, rgba(10,14,35,0.8) 76.65%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
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
