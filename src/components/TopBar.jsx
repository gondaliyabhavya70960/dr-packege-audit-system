import { MONO, glassFloat, glassPopover, cardLight } from '../data.js';
import { User, Settings, LogOut, ChevronUp, ChevronDown, ChevronLeft, Bell } from 'lucide-react';

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
  // z-index the dropdowns would paint under the screen content — and it must
  // also beat the top nav band below (zIndex 40) so open menus win
  position: 'relative',
  zIndex: 50,
};

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
        onClick={() => set({ profileMenuOpen: !s.profileMenuOpen, notifOpen: false })}
        style={{ display: 'flex', alignItems: 'center', gap: 9, height: 42, padding: '3px 14px 3px 5px', background: 'rgba(var(--surf-rgb),0.55)', border: '1px solid rgba(var(--surf-rgb),0.75)', borderRadius: 999, cursor: 'pointer' }}
      >
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.14)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{userInitial}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{userLabel}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', padding: '3px 8px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.14)', color: 'var(--accent)' }}>{roleChip}</span>
        <span style={{ display: 'flex', color: 'rgba(40,32,38,0.55)' }}>{s.profileMenuOpen ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}</span>
      </button>
      {s.profileMenuOpen && (
        <div style={{ ...glassPopover, position: 'absolute', right: 0, top: 54, width: 264, borderRadius: 22, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px 10px', borderBottom: '1px solid rgba(var(--ink-rgb),0.1)', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{userLabel}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent)' }}>{roleLine}</span>
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

// Notification bell with a count badge; opens a solid white panel listing the
// latest activity (newest order + open packing flags), each row navigating to
// the thing it describes.
function NotificationsBell({ ctx }) {
  const { s, set, openOrder } = ctx;
  const newest = [...s.orders].sort((a, b) => b.ts - a.ts)[0];
  const items = [
    ...(newest
      ? [{ key: 'new-order', title: 'New order ' + newest.id + ' received', age: 'today', go: () => { set({ notifOpen: false }); openOrder(newest.id); } }]
      : []),
    ...s.flags.slice(0, 2).map((f, i) => ({
      key: 'flag-' + i,
      title: 'Packing flag (' + f.reason + ') on ' + f.id,
      age: f.age,
      go: () => {
        if (s.role === 'admin') set({ notifOpen: false, screen: 'dash-flagged', profileMenuOpen: false });
        else {
          set({ notifOpen: false });
          openOrder(f.id);
        }
      },
    })),
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="hv-white85"
        onClick={() => set({ notifOpen: !s.notifOpen, profileMenuOpen: false })}
        title="Notifications"
        aria-label={'Notifications · ' + items.length + ' new'}
        style={{ position: 'relative', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--surf-rgb),0.55)', border: '1px solid rgba(var(--surf-rgb),0.75)', color: 'var(--accent)', borderRadius: '50%', cursor: 'pointer' }}
      >
        <Bell size={18} aria-hidden="true" />
        {items.length > 0 && (
          <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: '#E02D3C', color: '#FFFFFF', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.9)' }}>{items.length}</span>
        )}
      </button>
      {s.notifOpen && (
        <div style={{ ...cardLight, borderRadius: 14, position: 'absolute', right: 0, top: 52, width: 380, maxWidth: '86vw', padding: '14px 6px 8px', display: 'flex', flexDirection: 'column', gap: 2, zIndex: 60 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', color: 'var(--mute-2)', padding: '0 14px 8px' }}>NOTIFICATIONS</span>
          {items.length === 0 && <span style={{ fontSize: 13, color: 'var(--mute)', padding: '4px 14px 10px' }}>You're all caught up.</span>}
          {items.map((n) => (
            <button key={n.key} className="hv-white7" onClick={n.go} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: 10, padding: '9px 14px', cursor: 'pointer' }}>
              <span style={{ width: 7, height: 7, flex: 'none', borderRadius: '50%', background: 'var(--accent)', marginTop: 6 }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', lineHeight: 1.35 }}>{n.title}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{n.age}</span>
              </span>
            </button>
          ))}
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

// One top bar for the whole app — logo, notifications, Tour and the profile.
// Identical on every screen; only a Back button appears during a standalone
// recording session (needed to exit it safely).
export default function TopBar({ ctx }) {
  const { s, set, openTour } = ctx;
  const isSession = ['pack', 'recv', 'ret'].includes(s.screen);
  const isAdmin = s.role === 'admin';

  // The Mayavé logo always routes home (the Overview dashboard). If the operator
  // is mid-edit — a live recording session or an order being created / edited —
  // guard the jump with a save-all-details popup instead of leaving silently.
  const inOrderSession = s.screen === 'order' && ['pack', 'recv', 'ret'].includes(s.orderTab);
  const hasUnsaved = s.orderEditing || isSession || inOrderSession;
  const goDashboard = () => {
    if (hasUnsaved) return set({ leaveConfirm: true });
    set({ screen: 'home', profileMenuOpen: false, adminMenuOpen: false, notifOpen: false });
  };

  return (
    <div data-tour="topbar" className="topbar" style={barStyle}>
      <button onClick={goDashboard} title="Go to dashboard" aria-label="Go to dashboard" className="hv-brighten" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', borderRadius: 8 }}>
        <img src="/assets/mayave-logo.png" alt="Mayavé" width={97} height={40} style={{ height: 40, width: 'auto', display: 'block' }} />
      </button>
      {isSession && (
        <button
          className="hv-white75"
          onClick={() => set({ backConfirm: true })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(0,0,0,0.06)', color: 'var(--ink-2)', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <ChevronLeft size={15} aria-hidden="true" /> Back
        </button>
      )}
      <div style={{ flex: 1 }} />
      <NotificationsBell ctx={ctx} />
      <TourButton onClick={openTour} />
      <ProfileMenu ctx={ctx} roleChip={isAdmin ? 'ADMIN' : 'OPERATOR'} roleLine={isAdmin ? 'ADMIN · ALL ACCESS' : 'OPERATOR · PACK · RECEIVE · RETURNS'} />
    </div>
  );
}
