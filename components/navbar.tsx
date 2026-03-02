'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header style={{
      height: 60,
      background: '#0f0f13',
      borderBottom: '1px solid #1a1a28',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 200,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 160 }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px', background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ConiaCloud
        </span>
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Desktop auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: '#9ca3af', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              style={{ background: '#1e1e35', border: '1px solid #2a2a3a', color: '#f87171', padding: '6px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#2a1a2e')}
              onMouseOut={e => (e.currentTarget.style.background = '#1e1e35')}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/sign-in" style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            <Link href="/sign-up" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'none', padding: 4 }}
        className="show-mobile"
        aria-label="Menu"
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {mobileOpen
            ? <><path d="M6 18L18 6"/><path d="M6 6l12 12"/></>
            : <><path d="M3.75 6.75h16.5"/><path d="M3.75 12h16.5"/><path d="M3.75 17.25h16.5"/></>
          }
        </svg>
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, background: '#0f0f13', borderBottom: '1px solid #1a1a28', padding: '16px 20px', zIndex: 199, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{user.email}</span>
              </div>
              <button onClick={() => { signOut(); setMobileOpen(false); }}
                style={{ background: '#1e1e35', border: '1px solid #2a2a3a', color: '#f87171', padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" onClick={() => setMobileOpen(false)}
                style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>Sign in</Link>
              <Link href="/sign-up" onClick={() => setMobileOpen(false)}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '8px 16px', borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
