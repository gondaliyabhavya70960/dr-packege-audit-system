import { MONO, glassPopover, cardLight } from '../data.js';
import { ChevronDown, ChevronUp, LayoutGrid, Package, Truck } from './fa.jsx';

const ADMIN_ONLY_SCREENS = ['search', 'dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations', 'config'];

const MENU_BG = 'rgba(var(--surf-rgb),0.88)';
const MENU_BORDER = '1px solid rgba(var(--surf-rgb),0.9)';

export default function TabBar({ ctx }) {
  const { s, set, openPlayer, openList } = ctx;
  const screen = s.screen;

  // primary nav: the overview dashboard plus the two working lists. The
  // warehouse/store side is chosen at login, not here.
  const navTabs = [
    { id: 'home', label: 'Overview', Icon: LayoutGrid },
    { id: 'packaging', label: 'Packaging', Icon: Package },
    { id: 'transfer', label: 'Transfers', Icon: Truck },
  ];

  const adminMenuItems = [
    { id: 'search', label: 'Search & playback' },
    { id: 'player', label: 'Side-by-side player' },
    { id: 'dash-coverage', label: 'Coverage' },
    { id: 'dash-consignment', label: 'Consignment' },
    { id: 'dash-returns', label: 'Returns summary' },
    { id: 'dash-flagged', label: 'Flagged queue', badge: String(s.flags.length) },
    { id: 'dash-stations', label: 'Station health' },
    { id: 'config', label: 'Users & config' },
  ];

  const adminActive = ADMIN_ONLY_SCREENS.includes(screen);
  const adminOpen = s.adminMenuOpen;
  // "connected fill": the trigger carries the accent fill whenever it's active OR its menu is open,
  // so the button and the dropdown read as one continuous surface.
  const adminFilled = adminActive || adminOpen;
  const onOrders = screen === 'orders' || screen === 'order';
  const navActive = (id) => (id === 'home' ? screen === 'home' : onOrders && s.listKind === id);
  const navGo = (id) => (id === 'home' ? set({ screen: 'home', adminMenuOpen: false }) : openList(id));
  const divider = <div style={{ width: 1, height: 22, background: 'rgba(40,32,38,0.15)', margin: '0 2px' }} />;

  const pillBtn = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    cursor: 'pointer',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#FFFFFF' : 'rgba(40,32,38,0.7)',
    transition: 'background 0.18s ease, color 0.18s ease',
  });

  return (
    // top-level navigation floats at the bottom centre (the classic position).
    // data-tour sits on the pill itself so the tour spotlights it tightly.
    <div style={{ position: 'fixed', left: '50%', bottom: 18, transform: 'translateX(-50%)', zIndex: 40 }}>
      <div data-tour="nav" style={{ ...cardLight, display: 'flex', gap: 4, alignItems: 'center', padding: 6, borderRadius: 999 }}>
        {navTabs.map((t) => (
          <button key={t.id} onClick={() => navGo(t.id)} style={pillBtn(navActive(t.id))}>
            <t.Icon size={16} aria-hidden="true" style={{ flex: 'none' }} />
            {t.label}
          </button>
        ))}

        {s.role === 'admin' && (
          <>
            {divider}
            {/* anchor the dropdown to the trigger so they read as one connected element */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => set({ adminMenuOpen: !s.adminMenuOpen })} style={{ ...pillBtn(adminFilled), display: 'flex', alignItems: 'center', gap: 7 }}>
                <span>Admin</span>
                {adminOpen ? <ChevronDown size={13} aria-hidden="true" /> : <ChevronUp size={13} aria-hidden="true" />}
              </button>

              {adminOpen && (
                <>
                  {/* pointer that visually ties the menu to the trigger, centred over the button */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 5px)',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: 12,
                      height: 12,
                      background: MENU_BG,
                      borderRight: MENU_BORDER,
                      borderBottom: MENU_BORDER,
                      backdropFilter: 'blur(30px) saturate(1.7)',
                      WebkitBackdropFilter: 'blur(30px) saturate(1.7)',
                      zIndex: 43,
                    }}
                  />
                  <div
                    style={{
                      ...glassPopover,
                      position: 'absolute',
                      bottom: 'calc(100% + 11px)',
                      right: 0,
                      width: 280,
                      maxWidth: '78vw',
                      borderRadius: 18,
                      padding: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      zIndex: 42,
                    }}
                  >
                    <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--ink)', padding: '8px 12px 6px' }}>ADMIN TOOLS</div>
                    {adminMenuItems.map((n) => {
                      const active = screen === n.id;
                      return (
                        <button
                          key={n.id}
                          className="hv-white65"
                          onClick={() => {
                            if (n.id === 'player') {
                              set({ adminMenuOpen: false });
                              openPlayer('ORD-10293', -1, null);
                            } else {
                              set({ screen: n.id, adminMenuOpen: false });
                            }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', border: 'none', cursor: 'pointer', borderRadius: 11, padding: '10px 12px', fontSize: 14, fontWeight: 600, background: active ? 'rgba(var(--accent-rgb),0.14)' : 'transparent', color: active ? 'var(--accent)' : 'var(--ink-2)' }}
                        >
                          <span style={{ flex: 1 }}>{n.label}</span>
                          {n.badge && (
                            <span style={{ fontFamily: MONO, fontSize: 11, padding: '1px 8px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.14)', color: 'var(--accent)' }}>{n.badge}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
