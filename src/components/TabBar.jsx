import { MONO, glassFloat, glassPopover } from '../data.js';

const ADMIN_ONLY_SCREENS = ['search', 'dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations', 'config'];

const MENU_BG = 'var(--popover-bg)';
const MENU_BORDER = '1px solid var(--popover-border)';

export default function TabBar({ ctx }) {
  const { s, set, openPlayer } = ctx;
  const screen = s.screen;

  const taskTabs = [
    { id: 'pack', label: 'Pack' },
    { id: 'recv', label: 'Receive' },
    { id: 'ret', label: 'Returns' },
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
  const ordersActive = screen === 'orders' || screen === 'order';
  const divider = <div style={{ width: 1, height: 22, background: 'var(--line-strong)', margin: '0 2px' }} />;

  const pillBtn = (active) => ({
    border: 'none',
    cursor: 'pointer',
    borderRadius: 999,
    padding: '10px 18px',
    fontSize: 13.5,
    fontWeight: 700,
    background: active ? '#8E0E22' : 'transparent',
    color: active ? '#FFFFFF' : 'var(--ink-70)',
    transition: 'background 0.18s ease, color 0.18s ease',
  });

  return (
    <div data-tour="nav" style={{ position: 'fixed', left: '50%', bottom: 18, transform: 'translate(calc(-50% + var(--px) * 6px), calc(var(--py) * -4px))', zIndex: 40 }}>
      <div style={{ ...glassFloat, position: 'relative', display: 'flex', gap: 4, alignItems: 'center', padding: 6, borderRadius: 999, overflow: 'visible' }}>
        {/* pointer-following specular sheen ("lensing") */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            pointerEvents: 'none',
            background: 'radial-gradient(150px circle at calc(50% + var(--px) * 42%) calc(50% + var(--py) * 60%), rgba(255,255,255,0.5), transparent 70%)',
            mixBlendMode: 'soft-light',
            opacity: 0.9,
          }}
        />
        {taskTabs.map((t) => {
          const active = screen === t.id || (screen === 'kiosk' && s.mode === t.id);
          return (
            <button key={t.id} onClick={() => set({ screen: 'kiosk', mode: t.id, adminMenuOpen: false })} style={pillBtn(active)}>
              {t.label}
            </button>
          );
        })}

        {/* Orders — available to every role */}
        {divider}
        <button data-tour="ordersnav" onClick={() => set({ screen: 'orders', adminMenuOpen: false })} style={pillBtn(ordersActive)}>
          Orders
        </button>

        {s.role === 'admin' && (
          <>
            {divider}
            {/* anchor the dropdown to the trigger so they read as one connected element */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => set({ adminMenuOpen: !s.adminMenuOpen })} style={{ ...pillBtn(adminFilled), display: 'flex', alignItems: 'center', gap: 7 }}>
                <span>Admin</span>
                <span style={{ fontSize: 10 }}>{adminOpen ? '▾' : '▴'}</span>
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
                      borderRadius: 22,
                      padding: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      zIndex: 42,
                    }}
                  >
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-55)', padding: '8px 12px 6px' }}>ADMIN TOOLS</div>
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
                          style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', border: 'none', cursor: 'pointer', borderRadius: 11, padding: '10px 12px', fontSize: 14, fontWeight: 600, background: active ? 'rgba(142,14,34,0.14)' : 'transparent', color: active ? '#8E0E22' : 'var(--ink)' }}
                        >
                          <span style={{ flex: 1 }}>{n.label}</span>
                          {n.badge && (
                            <span style={{ fontFamily: MONO, fontSize: 11, padding: '1px 8px', borderRadius: 999, background: 'rgba(142,14,34,0.14)', color: '#8E0E22' }}>{n.badge}</span>
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
