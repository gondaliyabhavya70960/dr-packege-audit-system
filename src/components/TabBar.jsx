import { MONO } from '../data.js';

const ADMIN_SCREENS = ['search', 'orders', 'order', 'dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations', 'config'];

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
    { id: 'orders', label: 'Orders', badge: String(s.orders.length) },
    { id: 'player', label: 'Side-by-side player' },
    { id: 'dash-coverage', label: 'Coverage' },
    { id: 'dash-consignment', label: 'Consignment' },
    { id: 'dash-returns', label: 'Returns summary' },
    { id: 'dash-flagged', label: 'Flagged queue', badge: String(s.flags.length) },
    { id: 'dash-stations', label: 'Station health' },
    { id: 'config', label: 'Users & config' },
  ];

  const adminActive = ADMIN_SCREENS.includes(screen);

  return (
    <div data-tour="nav" style={{ position: 'fixed', left: '50%', bottom: 18, transform: 'translateX(-50%)', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {s.adminMenuOpen && (
        <div style={{ width: 280, borderRadius: 18, padding: 8, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(30px) saturate(1.7)', WebkitBackdropFilter: 'blur(30px) saturate(1.7)', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 16px 48px rgba(60,30,40,0.24)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(40,32,38,0.55)', padding: '8px 12px 6px' }}>ADMIN TOOLS</div>
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
                style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', border: 'none', cursor: 'pointer', borderRadius: 11, padding: '10px 12px', fontSize: 14, fontWeight: 600, background: active ? 'rgba(142,14,34,0.14)' : 'transparent', color: active ? '#8E0E22' : '#1B1D21' }}
              >
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge && (
                  <span style={{ fontFamily: MONO, fontSize: 11, padding: '1px 8px', borderRadius: 999, background: 'rgba(142,14,34,0.14)', color: '#8E0E22' }}>{n.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: 6, borderRadius: 999, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(30px) saturate(1.7)', WebkitBackdropFilter: 'blur(30px) saturate(1.7)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 16px 48px rgba(60,30,40,0.22), inset 0 1px 0 rgba(255,255,255,0.85)' }}>
        {taskTabs.map((t) => {
          const active = screen === t.id || (screen === 'kiosk' && s.mode === t.id);
          return (
            <button
              key={t.id}
              onClick={() => set({ screen: 'kiosk', mode: t.id, adminMenuOpen: false })}
              style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, background: active ? '#8E0E22' : 'transparent', color: active ? '#FFFFFF' : 'rgba(40,32,38,0.7)' }}
            >
              {t.label}
            </button>
          );
        })}
        {s.role === 'admin' && (
          <>
            <div style={{ width: 1, height: 22, background: 'rgba(40,32,38,0.15)', margin: '0 2px' }} />
            <button
              onClick={() => set({ adminMenuOpen: !s.adminMenuOpen })}
              style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', borderRadius: 999, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, background: adminActive ? '#8E0E22' : 'transparent', color: adminActive ? '#FFFFFF' : 'rgba(40,32,38,0.7)' }}
            >
              <span>Admin</span>
              <span style={{ fontSize: 10 }}>{s.adminMenuOpen ? '▼' : '▲'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
