import { MONO, glassFloat, glassPopover } from '../data.js';
import { User, Settings, LogOut } from 'lucide-react';
import AccentPicker from './AccentPicker.jsx';

const SCREEN_CHIPS = { home: 'OVERVIEW', kiosk: 'STATION READY', pack: 'PACK & RECORD', recv: 'STORE RECEIVING', ret: 'RETURN INSPECTION' };

function SideChip({ side }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', padding: '4px 11px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)' }}>
      {side === 'store' ? 'STORE' : 'WAREHOUSE'}
    </span>
  );
}

const barStyle = {
  ...glassFloat,
  height: 58,
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 20px',
  margin: '14px 16px 0',
  borderRadius: 999,
  // the backdrop-filter creates a stacking context; without an explicit
  // z-index the profile dropdown would paint under the screen content
  position: 'relative',
  zIndex: 10,
};

function StatusChip({ label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: MONO, fontSize: 11, color: '#41464E', padding: '5px 11px', background: 'rgba(var(--surf-rgb),0.82)', border: '1px solid rgba(var(--surf-rgb),0.9)', borderRadius: 999 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#17A35F' }} />
      {label}
    </span>
  );
}

export function ProfileMenu({ ctx, roleChip, roleLine }) {
  const { s, set, showToast, signOut } = ctx;

  const goProfile = () => {
    set({ profileMenuOpen: false });
    showToast('My profile — name, PIN and shift details (prototype).');
  };
  const goSettings = () => {
    if (s.role === 'admin') set({ profileMenuOpen: false, screen: 'config' });
    else {
      set({ profileMenuOpen: false });
      showToast('Station settings are managed by an admin.');
    }
  };

  const userLabel = s.userLabel || 'Mira';
  const userInitial = userLabel.charAt(0).toUpperCase();
  const itemStyle = { display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', border: 'none', background: 'transparent', borderRadius: 11, padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="hv-white85"
        onClick={() => set({ profileMenuOpen: !s.profileMenuOpen })}
        style={{ display: 'flex', alignItems: 'center', gap: 9, height: 42, padding: '3px 14px 3px 5px', background: 'rgba(var(--surf-rgb),0.55)', border: '1px solid rgba(var(--surf-rgb),0.75)', borderRadius: 999, cursor: 'pointer' }}
      >
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.14)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{userInitial}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{userLabel}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', padding: '3px 8px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.14)', color: 'var(--accent)' }}>{roleChip}</span>
        <span style={{ fontSize: 9, color: 'rgba(40,32,38,0.55)' }}>{s.profileMenuOpen ? '▲' : '▼'}</span>
      </button>
      {s.profileMenuOpen && (
        <div style={{ ...glassPopover, position: 'absolute', right: 0, top: 54, width: 264, borderRadius: 22, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px 10px', borderBottom: '1px solid rgba(var(--ink-rgb),0.1)', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{userLabel}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent)' }}>{roleLine}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '4px 8px 8px' }}>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: 'var(--mute)' }}>ACCENT</span>
            <AccentPicker value={s.accent} onPick={(c) => set({ accent: c })} compact />
          </div>
          <div style={{ height: 1, background: 'rgba(var(--ink-rgb),0.08)', margin: '4px 6px' }} />
          <button className="hv-white7" onClick={goProfile} style={itemStyle}>
            <User size={16} aria-hidden="true" />
            My profile
          </button>
          <button className="hv-white7" onClick={goSettings} style={itemStyle}>
            <Settings size={16} aria-hidden="true" />
            Settings
          </button>
          <div style={{ height: 1, background: 'rgba(40,32,38,0.08)', margin: '4px 6px' }} />
          <button className="hv-red08" onClick={signOut} style={{ ...itemStyle, fontWeight: 700, color: '#C62B22' }}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function TourButton({ onClick }) {
  return (
    <button
      className="hv-white85"
      onClick={onClick}
      title="App guide"
      style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', background: 'rgba(var(--surf-rgb),0.55)', border: '1px solid rgba(var(--surf-rgb),0.75)', color: 'var(--accent)', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
    >
      <img src="/assets/app-guide.svg" alt="App guide" style={{ width: 18, height: 18 }} />
      Tour
    </button>
  );
}

export default function TopBar({ ctx, variant }) {
  const { s, set, openTour } = ctx;
  const isSession = ['pack', 'recv', 'ret'].includes(s.screen);
  // station id, side + live-health chips belong to a single order; everywhere
  // else (overview, lists, kiosk) the top bar stays clean.
  const showStation = s.screen === 'order';

  // The Mayavé logo always routes home (the Overview dashboard). If the operator
  // is mid-edit — a live recording session or an order being created / edited —
  // guard the jump with a save-all-details popup instead of leaving silently.
  const inOrderSession = s.screen === 'order' && ['pack', 'recv', 'ret'].includes(s.orderTab);
  const hasUnsaved = s.orderEditing || isSession || inOrderSession;
  const goDashboard = () => {
    if (hasUnsaved) return set({ leaveConfirm: true });
    set({ screen: 'home', profileMenuOpen: false, adminMenuOpen: false });
  };
  const Logo = (
    <button onClick={goDashboard} title="Go to dashboard" aria-label="Go to dashboard" className="hv-brighten" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', borderRadius: 8 }}>
      <img src="/assets/mayave-logo.png" alt="Mayavé" width={97} height={40} style={{ height: 40, width: 'auto', display: 'block' }} />
    </button>
  );

  if (variant === 'admin') {
    return (
      <div className="topbar" style={barStyle}>
        {Logo}
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em', color: 'rgba(40,32,38,0.55)' }}>ADMIN CONSOLE</span>
        {showStation && <SideChip side={s.side} />}
        <div style={{ flex: 1 }} />
        <TourButton onClick={openTour} />
        <ProfileMenu ctx={ctx} roleChip="ADMIN" roleLine="ADMIN · ALL ACCESS" />
      </div>
    );
  }

  return (
    <div data-tour="topbar" className="topbar" style={{ ...barStyle, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {Logo}
        {isSession && (
          <button
            className="hv-white75"
            onClick={() => set({ backConfirm: true })}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(0,0,0,0.06)', color: 'var(--ink-2)', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            ← Back
          </button>
        )}
        {showStation && (
          <>
            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)' }} />
            <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(var(--ink-rgb),0.7)', letterSpacing: '0.06em' }}>AUDIT-BENCH-1</span>
            <SideChip side={s.side} />
            {SCREEN_CHIPS[s.screen] && (
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', padding: '4px 11px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)' }}>{SCREEN_CHIPS[s.screen]}</span>
            )}
          </>
        )}
      </div>
      {showStation && (
        <div className="status-chips" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusChip label="Camera OK" />
          <StatusChip label="Uploads · 0 pending" />
          <StatusChip label="Online" />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TourButton onClick={openTour} />
        <ProfileMenu ctx={ctx} roleChip="OPERATOR" roleLine="OPERATOR · PACK · RECEIVE · RETURNS" />
      </div>
    </div>
  );
}
