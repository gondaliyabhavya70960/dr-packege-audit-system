import { MONO, demoChips } from '../data.js';

export default function KioskHome({ ctx }) {
  const { s, set, openSession, signOut } = ctx;

  const doScan = () => {
    const id = s.scanInput.trim();
    if (!id) return;
    openSession(s.mode, id.toUpperCase());
  };

  const bars = [
    [3, '100%'],
    [2, '68%'],
    [5, '100%'],
    [2, '80%'],
    [3, '58%'],
    [5, '100%'],
    [2, '72%'],
  ];

  return (
    <div data-screen-label="02 Kiosk home" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 28, overflow: 'auto' }}>
      <div style={{ width: 100, height: 100, flex: 'none', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(142,14,34,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ringPulse 2.6s ease-out infinite' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 30 }}>
          {bars.map(([w, h], i) => (
            <div key={i} style={{ width: w, height: h, background: '#8E0E22' }} />
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 760 }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em', textWrap: 'pretty' }}>Ready — scan an order ID, RFID, or challan</div>
        <div style={{ fontSize: 16, color: 'rgba(27,29,33,0.55)', textWrap: 'pretty' }}>Pick a task — Pack, Receive or Returns — then scan. The session opens and recording starts.</div>
      </div>

      <div data-tour="scanner" style={{ width: 700, maxWidth: '94%', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(26px) saturate(1.5)', WebkitBackdropFilter: 'blur(26px) saturate(1.5)', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 4px 18px rgba(15,30,60,0.06)' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em', color: '#8E0E22' }}>DEMO SCANNER — TAP TO SIMULATE A HID SCAN</div>
        <div className="demo-chip-grid">
          {demoChips.map((d) => (
            <button
              key={d.id}
              className="hv-chip"
              onClick={() => openSession(d.kind, d.id)}
              style={{ textAlign: 'left', background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: '13px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 500, color: '#1B1D21' }}>{d.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(27,29,33,0.5)' }}>{d.sub}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="fc-accent-white"
            value={s.scanInput}
            onChange={(e) => set({ scanInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doScan();
            }}
            placeholder="…or type any ID and press Enter (ORD-… / RFID-… / DC-…)"
            style={{ flex: 1, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, padding: '11px 18px', color: '#1B1D21', fontSize: 13, outline: 'none', fontFamily: MONO }}
          />
          <button className="hv-brighten" onClick={doScan} style={{ background: '#8E0E22', border: 'none', color: '#FFFFFF', borderRadius: 10, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Scan
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(27,29,33,0.5)' }}>Last session: {s.lastSession}</div>
        <button className="hv-text-mid" onClick={signOut} style={{ background: 'none', border: 'none', color: 'rgba(27,29,33,0.35)', fontFamily: MONO, fontSize: 11, cursor: 'pointer', letterSpacing: '0.08em' }}>
          ADMIN EXIT (PIN)
        </button>
      </div>
    </div>
  );
}
