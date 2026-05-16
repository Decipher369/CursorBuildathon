'use client';

import type { AppView, Business } from '@/lib/business-types';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IconAgent,
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

const SIDEBAR_BG = 'transparent';
const NAV_ROW_ACTIVE_BG = '#1a1f37';
const NAV_ICON_TILE_INACTIVE = '#1a1f37';
const NAV_ICON_ACTIVE = '#007bff';
const NAV_ICON_INACTIVE_COLOR = '#3182ce';
const TOPBAR_SCROLL_THRESHOLD = 8;

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
  const mainRef = useRef<HTMLElement>(null);
  const [topBarFloated, setTopBarFloated] = useState(false);

  const onMainScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    setTopBarFloated(el.scrollTop > TOPBAR_SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    setTopBarFloated(el ? el.scrollTop > TOPBAR_SCROLL_THRESHOLD : false);
  }, [activeView]);

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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: SIDEBAR_BG,
          borderRight: 'none',
        }}
      >
        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, padding: '40px 24px 22px' }}>
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
        <nav style={{ position: 'relative', zIndex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  fontSize: '14px', fontWeight: active ? 600 : 500,
                  color: '#fff',
                  background: active ? NAV_ROW_ACTIVE_BG : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? NAV_ICON_ACTIVE : NAV_ICON_TILE_INACTIVE,
                  boxShadow: 'none',
                  transition: 'background 0.2s',
                }}>
                  <Icon
                    style={{
                      width: '17px', height: '17px',
                      color: active ? '#fff' : NAV_ICON_INACTIVE_COLOR,
                    }}
                  />
                </span>
                <span>{label}</span>
              </button>
            );
          })}

          {/* TOOLS label */}
          <div style={{ padding: '18px 14px 6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            Tools
          </div>

          {[
            { href: '/admin', label: 'Test Agent', Icon: IconFlask },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              prefetch
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                color: '#fff', background: 'transparent', transition: 'background 0.2s',
              }}
            >
              <span style={{
                width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: NAV_ICON_TILE_INACTIVE,
              }}>
                <Icon style={{ width: '17px', height: '17px', color: NAV_ICON_INACTIVE_COLOR }} />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Promo card — Vision UI "Need help?" mesh gradient */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            borderRadius: '18px',
            padding: '20px 18px 18px',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(155deg, #0d1038 0%, #151b6e 22%, #1e3a8a 42%, #2563eb 58%, #312e81 78%, #1e1b4b 100%)',
            boxShadow: '0 18px 48px rgba(15, 35, 140, 0.55)',
          }}>
            {/* Mesh blob — electric blue top-right */}
            <div style={{
              position: 'absolute',
              top: '-35%',
              right: '-28%',
              width: '95%',
              height: '85%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, rgba(96,165,250,0.75) 0%, rgba(59,130,246,0.35) 38%, transparent 68%)',
              filter: 'blur(28px)',
              pointerEvents: 'none',
            }} />
            {/* Mesh blob — deep indigo bottom */}
            <div style={{
              position: 'absolute',
              bottom: '-45%',
              left: '-20%',
              width: '100%',
              height: '70%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 30%, rgba(30,58,138,0.9) 0%, rgba(49,46,129,0.45) 45%, transparent 70%)',
              filter: 'blur(22px)',
              pointerEvents: 'none',
            }} />
            {/* Mesh streak — center highlight */}
            <div style={{
              position: 'absolute',
              top: '18%',
              left: '8%',
              width: '75%',
              height: '50%',
              background: 'radial-gradient(ellipse 85% 70% at 50% 50%, rgba(147,197,253,0.35) 0%, transparent 72%)',
              filter: 'blur(16px)',
              transform: 'rotate(-12deg)',
              pointerEvents: 'none',
            }} />
            {/* Purple edge wash */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(210deg, transparent 50%, rgba(76,29,149,0.22) 100%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Star only — no white tile (blends into mesh) */}
              <div style={{ marginBottom: '14px', lineHeight: 0 }}>
                <svg
                  style={{ width: '26px', height: '26px', color: '#38bdf8', filter: 'drop-shadow(0 0 14px rgba(56,189,248,0.85))' }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', margin: '0 0 6px' }}>Need help?</p>
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '12px', fontWeight: 500, lineHeight: 1.45, margin: '0 0 18px' }}>Please check our docs</p>
              <a
                href="https://github.com/Decipher369/CursorBuildathon"
                target="_blank"
                rel="noopener"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#fff',
                  textDecoration: 'none',
                  background: 'rgba(6, 10, 32, 0.55)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                DOCUMENTATION
              </a>
            </div>
          </div>

          {/* Cyan pill button — "Upgrade to PRO" style */}
          <Link
            href="/admin"
            prefetch
            style={{
              display: 'block', textAlign: 'center', padding: '12px 0',
              borderRadius: '50px', fontSize: '13px', fontWeight: 700,
              color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(90deg, #00d2ff 0%, #00b4d8 50%, #0096c7 100%)',
              boxShadow: 'none',
            }}
          >
            TEST AGENT
          </Link>
        </div>
      </aside>

      {/* Main content — scrolls independently, sidebar stays fixed */}
      <main
        ref={mainRef}
        onScroll={onMainScroll}
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: 'transparent' }}
      >
        {/* Top bar — transparent at scroll top; glossy rounded pill when scrolled */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            padding: topBarFloated ? '10px 16px 0' : '0',
            transition: 'padding 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 24px',
              background: topBarFloated
                ? 'linear-gradient(135deg, rgba(14, 22, 58, 0.58) 0%, rgba(12, 18, 48, 0.45) 100%)'
                : 'transparent',
              backdropFilter: topBarFloated ? 'blur(20px)' : 'none',
              WebkitBackdropFilter: topBarFloated ? 'blur(20px)' : 'none',
              borderRadius: topBarFloated ? '16px' : '0',
              boxShadow: topBarFloated
                ? '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)'
                : 'none',
              border: topBarFloated ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              transition: 'background 0.22s ease, box-shadow 0.22s ease, border-radius 0.22s ease, border-color 0.22s ease, backdrop-filter 0.22s ease',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', width: '200px' }}>
              <svg style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Type here...</span>
            </div>

            {/* Sign in / profile */}
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
              <svg style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.85)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Sign in</span>
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
        <div style={{ flex: 1, padding: '20px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
