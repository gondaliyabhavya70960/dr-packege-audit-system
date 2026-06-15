import { MONO, glass, feedBg, fmt } from '../data.js';

const REASONS = ['wrong item', 'not genuine', 'damaged', 'empty box'];

export default function ReturnInspection({ ctx }) {
  const { s, set, showToast, openPlayer, logOrderEvent } = ctx;

  const exitNav = s.sessionReturn === 'order' ? { screen: 'order', orderTab: 'detail' } : { screen: 'kiosk' };

  const acceptRet = () => {
    const rec = { id: s.retId, kinds: 'return', outcome: 'accepted', tone: 'green', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today', hash: 'd9' + Math.random().toString(16).slice(2, 8) + '…5a10', pair: true };
    set({ ...exitNav, lastSession: s.retId + ' · return accepted · restock', records: [rec, ...s.records], orders: logOrderEvent(s.retId, 'Return accepted · restock') });
    showToast('Return accepted → restock. Outcome written back with video reference.');
  };

  const flagRet = () => {
    if (!s.retReason) {
      set({ retNeedReason: true });
      return;
    }
    const flag = { id: s.retId, reason: s.retReason, age: 'now', amt: '₹1.2L' };
    const rec = { id: s.retId, kinds: 'return', outcome: 'flagged', tone: 'red', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today', hash: 'e2' + Math.random().toString(16).slice(2, 8) + '…3f77', pair: true };
    set({ ...exitNav, lastSession: s.retId + ' · flagged · refund held', flags: [flag, ...s.flags], records: [rec, ...s.records], orders: logOrderEvent(s.retId, 'Return flagged · refund held') });
    showToast('Refund held — flag (' + s.retReason + ') awaits supervisor approval.');
  };

  return (
    <div data-screen-label="05 Return inspection" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 13, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E53E3E', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <span style={{ fontFamily: MONO, fontSize: 12, color: '#C62B22', letterSpacing: '0.18em' }}>REC</span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          Return inspection · <span style={{ fontFamily: MONO, fontWeight: 500 }}>{s.retId}</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 16, color: '#1B1D21', marginLeft: 8 }}>{fmt(s.recSec)}</span>
        <button className="hv-accent14" onClick={() => openPlayer(s.retId, -1, 'ret')} style={{ marginLeft: 'auto', background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Open side-by-side
        </button>
      </div>

      <div className="ret-grid">
        <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53E3E', animation: 'pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: '#C62B22' }}>LIVE · UNBOXING — RETURNS DESK</span>
          </div>
          <div style={{ flex: 1, margin: 12, borderRadius: 14, ...feedBg, animation: 'feedDrift 6s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>[ live feed — unboxing · returns desk ]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px 12px' }}>
            <button className="hv-border-accent" onClick={() => set({ retStills: s.retStills + 1 })} style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.06)', color: '#1B1D21', borderRadius: 999, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              📷 Capture still
            </button>
            <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(27,29,33,0.55)' }}>stills: {s.retStills} · stone / hallmark / cert</span>
          </div>
        </div>

        <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: 'rgba(27,29,33,0.55)' }}>ORIGINAL PACK CLIP — AUTO-PULLED</span>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.45)', color: 'rgba(27,29,33,0.5)' }}>packed 12 Jun · PACK-BENCH-1</span>
          </div>
          <div style={{ flex: 1, margin: 12, borderRadius: 14, ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
            <span style={{ width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 18, background: 'rgba(142,14,34,0.9)' }}>▶</span>
            <span style={{ position: 'absolute', bottom: 10, left: 12, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>[ pack video — same order ID ]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.4)' }}>the decisive evidence in a 'not genuine' claim</span>
          </div>
        </div>
      </div>

      <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Outcome · reason</span>
        {REASONS.map((r) => {
          const active = s.retReason === r;
          return (
            <button
              key={r}
              onClick={() => set({ retReason: r, retNeedReason: false })}
              style={{ cursor: 'pointer', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, border: '1px solid ' + (active ? 'rgba(142,14,34,0.7)' : 'rgba(0,0,0,0.14)'), background: active ? 'rgba(142,14,34,0.1)' : 'transparent', color: active ? '#8E0E22' : 'rgba(27,29,33,0.6)' }}
            >
              {r}
            </button>
          );
        })}
        {s.retNeedReason && <span style={{ fontSize: 13, fontWeight: 600, color: '#C62B22' }}>← pick a reason to flag</span>}
        <div style={{ flex: 1 }} />
        <button className="hv-red05" onClick={flagRet} style={{ background: '#FFFFFF', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Flag → hold refund
        </button>
        <button className="hv-brighten" onClick={acceptRet} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
          Accept → restock
        </button>
      </div>
    </div>
  );
}
