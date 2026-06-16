import { Check } from 'lucide-react';
import { MONO } from '../data.js';
import { PackageIcon } from '../components/icons.jsx';

export default function Login({ ctx }) {
  const { s, set, openTour } = ctx;

  const doLogin = () => {
    const uname = (s.username || 'admin').trim().toLowerCase();
    const isAd = uname === 'admin' || uname === 'manager' || uname === 'auditor';
    const label = uname === 'admin' ? 'System Admin' : uname.charAt(0).toUpperCase() + uname.slice(1);
    set({ screen: 'home', userLabel: label, role: isAd ? 'admin' : 'operator' });
  };
  const onKey = (e) => {
    if (e.key === 'Enter') doLogin();
  };

  const check = (
    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#16A34A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
  );

  return (
    <div data-screen-label="01 Login" className="login-split">
      <div style={{ background: 'radial-gradient(900px 600px at 80% 20%, #A81330, #7C0A1A 70%)', color: '#FFFFFF', padding: '44px 48px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageIcon size={20} color="#FFFFFF" />
          </span>
          <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>Packaging Audit</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.01em', maxWidth: 480, textWrap: 'pretty' }}>
          One ID. Every checkpoint. Video proof you can pull up in seconds.
        </div>
        <div style={{ marginTop: 30, width: 430, maxWidth: '100%', background: 'rgba(255,255,255,0.96)', color: '#1B1D21', borderRadius: 22, padding: 18, boxShadow: '0 30px 70px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700 }}>DC-2026-00417</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FBE5E8', color: '#C8102E', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8102E', animation: 'pulse 1.4s ease-in-out infinite' }} />
              REC
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 11, background: '#FBE5E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <PackageIcon size={20} color="#8E0E22" />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#8E0E22' }}>Order ORD-2026-4471</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>3 items · Top + Front cameras</span>
            </div>
          </div>
          <div style={{ height: 1, background: '#F0F1F3' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {check}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Packed · Warehouse</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6B7280' }}>09:14</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {check}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Received · Store</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6B7280' }}>11:42</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid #F0A52E', background: '#FFFFFF', flex: 'none' }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Out for delivery</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#C8102E' }}>live</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#E3F5EC', color: '#11704B', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, fontWeight: 600 }}><Check size={15} strokeWidth={3} aria-hidden="true" /> Detected 3 / 3 SKUs — matches challan</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.75)' }}>SOC-2 governance · RBAC · configurable retention</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 420, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: '#8E0E22', letterSpacing: '-0.01em' }}>Sign in</span>
            <span style={{ fontSize: 15, color: '#4B5563' }}>Enter your credentials to access the console.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: 14, fontWeight: 700 }}>Username</label>
            <input
              className="fc-accent"
              value={s.username}
              onChange={(e) => set({ username: e.target.value })}
              onKeyDown={onKey}
              placeholder="operator"
              style={{ background: '#FFFFFF', border: '1px solid rgba(110,100,108,0.35)', borderRadius: 10, padding: '13px 15px', fontSize: 15, outline: 'none', color: '#1B1D21' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: 14, fontWeight: 700 }}>Password</label>
            <input
              className="fc-accent"
              type="password"
              value={s.password}
              onChange={(e) => set({ password: e.target.value })}
              onKeyDown={onKey}
              placeholder="••••••••"
              style={{ background: '#FFFFFF', border: '1px solid rgba(110,100,108,0.35)', borderRadius: 10, padding: '13px 15px', fontSize: 15, outline: 'none', color: '#1B1D21' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: 14, fontWeight: 700 }}>Your side</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'warehouse', label: 'Warehouse' },
                { id: 'store', label: 'Store' },
              ].map((o) => {
                const on = s.side === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => set({ side: o.id })}
                    style={{ flex: 1, cursor: 'pointer', borderRadius: 12, padding: '12px 10px', fontSize: 14.5, fontWeight: 700, border: '1px solid ' + (on ? '#8E0E22' : 'rgba(110,100,108,0.35)'), background: on ? '#8E0E22' : '#FFFFFF', color: on ? '#FFFFFF' : '#1B1D21' }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 12.5, color: '#6B7280' }}>Warehouse can pack, receive &amp; return; Store packs &amp; returns.</span>
          </div>
          <button
            data-tour="login"
            className="hv-dark"
            onClick={doLogin}
            style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, boxShadow: '0 8px 22px -8px rgba(142,14,34,0.6), inset 0 1px 0 rgba(255,255,255,0.25)' }}
          >
            Sign in
          </button>
          <div style={{ height: 1, background: '#E5E7EB', marginTop: 8 }} />
          <div style={{ textAlign: 'center', fontSize: 13.5, color: '#6B7280', lineHeight: 1.6 }}>
            Demo accounts (change before real use):
            <br />
            <b>admin / admin123</b> · console &nbsp;·&nbsp; <b>operator / operator123</b> · kiosk
            <br />
            manager / manager123 · auditor / auditor123
          </div>
          <button
            onClick={openTour}
            style={{ background: 'none', border: 'none', color: '#8E0E22', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', alignSelf: 'center' }}
          >
            Take a quick tour
          </button>
        </div>
      </div>
    </div>
  );
}
