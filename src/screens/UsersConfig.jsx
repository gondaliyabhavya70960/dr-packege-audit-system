import { MONO, glass } from '../data.js';

export default function UsersConfig({ ctx }) {
  const { s, set, showToast } = ctx;

  const addUser = () => {
    const n = s.newUser.trim();
    if (!n) return;
    set({ users: [...s.users, { name: n.charAt(0).toUpperCase() + n.slice(1), role: 'operator' }], newUser: '' });
    showToast('Operator added — covers Pack · Receive · Returns.');
  };

  const thresholds = [
    ['Coverage gap', 'alert < 95%'],
    ['Station down / queue backing up', 'alert > 30 min'],
    ['Flag ageing', 'escalate > 24 h'],
  ];

  return (
    <div data-screen-label="13 Admin users and config" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>Users &amp; configuration</h1>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', color: '#5B616B' }}>ADMIN ONLY</span>
      </div>

      <div className="config-grid">
        <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Users &amp; roles</span>
          {s.users.map((u) => {
            const isAd = u.role === 'admin';
            return (
              <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 14, padding: '11px 14px' }}>
                <span style={{ width: 28, height: 28, flex: 'none', borderRadius: '50%', background: 'rgba(142,14,34,0.1)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{u.name.charAt(0).toUpperCase()}</span>
                <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{u.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 999, border: '1px solid ' + (isAd ? 'rgba(142,14,34,0.5)' : 'rgba(0,0,0,0.16)'), color: isAd ? '#8E0E22' : '#5B616B' }}>{u.role}</span>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
            <input
              className="fc-accent-white"
              value={s.newUser}
              onChange={(e) => set({ newUser: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addUser();
              }}
              placeholder="name…"
              style={{ flex: 1, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, padding: '10px 16px', color: '#1B1D21', fontSize: 14, outline: 'none' }}
            />
            <button className="hv-accent14" onClick={addUser} style={{ background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              + Add operator
            </button>
          </div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>One Operator role covers Pack · Receive · Returns. Finer roles split out as the team grows.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Retention &amp; tiering</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: '#5B616B', flex: 1 }}>Retention window</span>
              <span style={{ fontFamily: MONO, fontSize: 14 }}>365 days</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: '#5B616B', flex: 1 }}>S3 tiering (hot → archive)</span>
              <button
                onClick={() => set({ tiering: !s.tiering })}
                style={{ cursor: 'pointer', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', border: '1px solid ' + (s.tiering ? 'rgba(23,163,95,0.5)' : 'rgba(0,0,0,0.2)'), background: s.tiering ? 'rgba(23,163,95,0.08)' : 'transparent', color: s.tiering ? '#0E8A50' : '#6B7280' }}
              >
                {s.tiering ? 'ON · running' : 'OFF'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Storage by tier · monthly growth +38 GB</span>
              <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
                <div style={{ width: '22%', background: '#8E0E22' }} />
                <div style={{ width: '33%', background: 'rgba(142,14,34,0.45)' }} />
                <div style={{ width: '45%', background: 'rgba(142,14,34,0.15)' }} />
              </div>
              <div style={{ display: 'flex', gap: 14, fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>
                <span>hot 96 GB</span>
                <span>infrequent 144 GB</span>
                <span>archive 198 GB</span>
              </div>
            </div>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Footage past retention is auto-deleted.</span>
          </div>

          <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Alert thresholds</span>
            {thresholds.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 14, padding: '11px 14px' }}>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#8E0E22' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
