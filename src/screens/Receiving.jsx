import { MONO, glass, feedBg, bannerTones, dotFor, fmt } from '../data.js';
import PrevStepClip from '../components/PrevStepClip.jsx';

export default function Receiving({ ctx }) {
  const { s, set, showToast, logOrderEvent } = ctx;

  const exitNav = s.sessionReturn === 'order' ? { screen: 'order', orderTab: 'detail' } : { screen: 'kiosk' };

  const rows = s.recvRows.map((r) => {
    const st = r.state === 'received' ? 'ok' : r.state === 'extra' ? 'bad' : 'wait';
    const d = dotFor(st);
    return { ...d, key: r.rfid, rfid: r.rfid, name: r.name, stateLabel: r.state };
  });

  const matched = s.recvRows.filter((r) => r.state === 'received').length;
  const expected = s.recvRows.filter((r) => r.state !== 'extra').length;
  const extras = s.recvRows.filter((r) => r.state === 'extra').length;
  const short = expected - matched;
  const summary = 'Matched ' + matched + ' / ' + expected + ' · ' + short + ' awaiting' + (extras ? ' · ' + extras + ' extra' : '');

  let banner;
  if (extras > 0) banner = { msg: '⚠ Unknown RFID scanned — not on this challan. Flag it as extra with the arrival video as proof.', tone: 'red' };
  else if (matched === 0) banner = { msg: 'Scan each RFID as you unpack — every scan ticks a line. Unscanned items are flagged short at close.', tone: 'amber' };
  else if (short > 0) banner = { msg: short + ' item' + (short === 1 ? '' : 's') + ' still awaiting — confirm now for a partial receive, or keep scanning.', tone: 'amber' };
  else banner = { msg: 'ALL MATCH — every expected RFID scanned. Confirm to move stock to shelf.', tone: 'green' };
  const bt = bannerTones[banner.tone];

  const scanItem = () => {
    const next = s.recvRows.map((r) => ({ ...r }));
    const hit = next.find((r) => r.state === 'awaiting');
    if (hit) {
      hit.state = 'received';
      set({ recvRows: next });
    }
  };

  const scanUnknown = () => {
    if (s.recvRows.some((r) => r.rfid === 'RFID-1099')) return;
    set({ recvRows: [...s.recvRows, { rfid: 'RFID-1099', name: 'not on challan', state: 'extra' }] });
  };

  const confirmRecv = () => {
    if (matched === 0) return;
    const out = short === 0 && extras === 0 ? 'received' : 'partial';
    const rec = { id: s.recvChallan, kinds: 'challan · receive', outcome: out, tone: out === 'received' ? 'green' : 'amber', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today', hash: 'c7' + Math.random().toString(16).slice(2, 8) + '…1b22', pair: false };
    set({ ...exitNav, lastSession: s.recvChallan + ' · ' + out, records: [rec, ...s.records], orders: logOrderEvent(s.recvChallan, 'Received · reconciled (' + out + ')') });
    showToast('Reconcile result (' + out + ') pushed to Gati — arrival video retained.');
  };

  const flagRecv = () => {
    const flag = { id: s.recvChallan, reason: short > 0 ? 'short ' + short : 'extra ' + extras, age: 'now', amt: '—' };
    set({ ...exitNav, lastSession: s.recvChallan + ' · flagged', flags: [flag, ...s.flags], orders: logOrderEvent(s.recvChallan, 'Receive flagged · short/extra') });
    showToast('Consignment flagged — both videos attached as proof.');
  };

  return (
    <div data-screen-label="04 Store receiving" className="recv-grid">
      {/* checklist + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ ...glass, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>Expected items — scan each RFID to tick</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(27,29,33,0.5)' }}>Challan {s.recvChallan}</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.45)', color: 'rgba(27,29,33,0.55)' }}>GATI · CHALLAN</span>
          </div>
          {rows.map((row) => (
            <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 14 }}>
              <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '1px solid ' + row.dotBorder, color: row.dotColor, background: row.dotBg }}>{row.dot}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontFamily: MONO, fontSize: 14 }}>{row.rfid}</span>
                <span style={{ fontSize: 13, color: 'rgba(27,29,33,0.55)' }}>{row.name}</span>
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: row.dotColor }}>{row.stateLabel}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={scanItem} disabled={short === 0} style={{ background: 'rgba(142,14,34,0.07)', border: '1px dashed rgba(142,14,34,0.45)', color: '#8E0E22', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: short === 0 ? 0.4 : 1 }}>
              Scan item RFID (demo)
            </button>
            <button onClick={scanUnknown} style={{ background: 'rgba(229,62,62,0.05)', border: '1px dashed rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Scan unknown RFID (demo)
            </button>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(27,29,33,0.7)', padding: '10px 14px', background: 'rgba(255,255,255,0.45)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.55)' }}>{summary}</div>
          <PrevStepClip ctx={ctx} id={s.recvChallan} fallbackLabel="Pack clip · warehouse" />
        </div>

        <div style={{ borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600, lineHeight: 1.45, border: '1px solid ' + bt.border, background: bt.bg, color: bt.color }}>{banner.msg}</div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="hv-red05" onClick={flagRecv} style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Flag short / extra
          </button>
          <button className="hv-brighten" onClick={confirmRecv} disabled={matched === 0} style={{ flex: 1, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: matched === 0 ? 0.4 : 1, boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
            Confirm received
          </button>
        </div>
      </div>

      {/* arrival feed */}
      <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E53E3E', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: '#C62B22', letterSpacing: '0.18em' }}>REC</span>
          <span style={{ fontFamily: MONO, fontSize: 14, color: '#1B1D21' }}>Arrival · {s.recvChallan}</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 17, color: '#1B1D21' }}>{fmt(s.recSec)}</span>
        </div>
        <div style={{ flex: 1, margin: 13, borderRadius: 16, position: 'relative', ...feedBg, animation: 'feedDrift 6s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>[ live feed — arrival · store webcam ]</span>
          <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '4px 9px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.75)' }}>CAM-02 · receiving point</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 13px 13px' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.4)' }}>arrival video retained with the pack video · both attach to any flag</span>
        </div>
      </div>
    </div>
  );
}
