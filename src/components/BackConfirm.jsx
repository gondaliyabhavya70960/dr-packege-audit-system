import { fmt, glassSheet } from '../data.js';

export default function BackConfirm({ ctx }) {
  const { s, set, showToast } = ctx;

  const sid = s.screen === 'pack' ? s.packId : s.screen === 'recv' ? s.recvChallan : s.retId;

  const discard = () => {
    set({ backConfirm: false, screen: 'kiosk', lastSession: sid + ' · discarded' });
    showToast('Session discarded — no video filed.');
  };

  const save = () => {
    const kind = s.screen === 'pack' ? 'pack' : s.screen === 'recv' ? 'challan · receive' : 'return';
    const rec = { id: sid, kinds: kind, outcome: 'draft', tone: 'amber', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today · paused at ' + fmt(s.recSec), hash: 'f0' + Math.random().toString(16).slice(2, 8) + '…2d88', pair: false };
    set({ backConfirm: false, screen: 'kiosk', lastSession: sid + ' · saved as draft', records: [rec, ...s.records] });
    showToast('Session saved as draft — scan ' + sid + ' to resume.');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(28,20,32,0.32)', backdropFilter: 'blur(14px) saturate(1.4)', WebkitBackdropFilter: 'blur(14px) saturate(1.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ ...glassSheet, width: 430, maxWidth: '94%', borderRadius: 26, padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>Leave this session?</span>
        <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.6)', lineHeight: 1.5, textWrap: 'pretty' }}>
          Recording will stop. Save your progress as a draft to resume later, or discard the session — no video will be filed.
        </span>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button className="hv-white75" onClick={() => set({ backConfirm: false })} style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.06)', color: 'rgba(27,29,33,0.7)', borderRadius: 10, padding: '12px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <div style={{ flex: 1 }} />
          <button className="hv-red05" onClick={discard} style={{ background: '#FFFFFF', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: '12px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Discard
          </button>
          <button className="hv-brighten" onClick={save} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
            Save &amp; exit
          </button>
        </div>
      </div>
    </div>
  );
}
