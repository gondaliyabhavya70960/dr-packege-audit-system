import { MONO, glass, feedBg, bannerTones, dotFor, fmt } from '../data.js';

export default function PackRecord({ ctx }) {
  const { s, set, showToast, logOrderEvent } = ctx;

  // where the session goes when it closes: back to the order's Detail tab when run
  // inline on a single order, otherwise back to the kiosk.
  const exitNav = s.sessionReturn === 'order' ? { screen: 'order', orderTab: 'detail' } : { screen: 'kiosk' };

  const items = s.packItems;
  const allScanned = items.length > 0 && items.every((i) => i.got >= i.need);
  const unknown = s.packUnknown;
  const condOk = s.packCond === 'confirmed';
  const pass = allScanned && !unknown && condOk;
  const missing = items.reduce((n, i) => n + Math.max(0, i.need - i.got), 0);

  let banner;
  if (unknown) banner = { msg: '⚠ HOLD — unknown item on the bench. Remove it or flag with evidence. Session locked.', tone: 'red' };
  else if (!allScanned) banner = { msg: '⚠ HOLD — ' + missing + ' item' + (missing === 1 ? '' : 's') + ' not yet scanned. Session locked until item + qty + condition pass.', tone: 'red' };
  else if (!condOk) banner = { msg: 'Items match ✓ — verify condition to unlock Close. Show each piece to the camera.', tone: 'amber' };
  else banner = { msg: 'PASS — item, quantity and condition verified. Seal the box and close the session.', tone: 'green' };
  const bt = bannerTones[banner.tone];

  const rows = items.map((i) => {
    const d = dotFor(i.got >= i.need ? 'ok' : 'wait');
    return { ...d, key: i.sku, name: i.name, sku: i.sku, count: i.got + '/' + i.need + (i.got >= i.need ? ' ✓' : ' ···') };
  });
  if (unknown) {
    const d = dotFor('bad');
    rows.push({ ...d, key: 'unknown', name: 'UNKNOWN ITEM', sku: 'RFID-9920 · not on this order', count: 'extra !' });
  }

  const scanPackItem = () => {
    const next = items.map((i) => ({ ...i }));
    const hit = next.find((i) => i.got < i.need);
    if (hit) {
      hit.got += 1;
      set({ packItems: next });
    }
  };

  const closePack = () => {
    if (!pass) return;
    const rec = { id: s.packId, kinds: 'pack', outcome: 'PASS', tone: 'green', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today · ' + fmt(s.recSec) + ' session', hash: 'a1' + Math.random().toString(16).slice(2, 8) + '…e4f2', pair: false };
    set({ ...exitNav, lastSession: s.packId + ' · sealed · PASS', records: [rec, ...s.records], orders: logOrderEvent(s.packId, 'Packed · Warehouse') });
    showToast('Pack video filed under ' + s.packId + ' — dispatch confirmed → Gati');
  };

  const flagPack = () => {
    const flag = { id: s.packId, reason: 'pack mismatch', age: 'now', amt: '—' };
    const rec = { id: s.packId, kinds: 'pack', outcome: 'HOLD', tone: 'red', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today', hash: 'b3' + Math.random().toString(16).slice(2, 8) + '…7c01', pair: false };
    set({ ...exitNav, lastSession: s.packId + ' · HOLD · flagged', flags: [flag, ...s.flags], records: [rec, ...s.records], orders: logOrderEvent(s.packId, 'Pack flagged · hold') });
    showToast('Session held — flag raised with video evidence. Supervisor notified.');
  };

  return (
    <div data-screen-label="03 Pack and Record" className="pack-grid">
      {/* live feed */}
      <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E53E3E', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: '#C62B22', letterSpacing: '0.18em' }}>REC</span>
          <span style={{ fontFamily: MONO, fontSize: 14, color: '#1B1D21' }}>Session {s.packId}</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 17, color: '#1B1D21' }}>{fmt(s.recSec)}</span>
        </div>
        <div style={{ flex: 1, margin: 13, borderRadius: 16, position: 'relative', ...feedBg, animation: 'feedDrift 6s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>[ live feed — top-view · pack bench ]</span>
          <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '4px 9px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.75)' }}>CAM-01 · 1080p · top view</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 13px 13px' }}>
          <button className="hv-border-accent" onClick={() => set({ packStills: s.packStills + 1 })} style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.06)', color: '#1B1D21', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            📷 Capture still
          </button>
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(27,29,33,0.55)' }}>stills: {s.packStills}</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.4)' }}>chunks hashed at capture · uploading</span>
        </div>
      </div>

      {/* checklist + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ ...glass, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span data-tour="packlist" style={{ fontSize: 17, fontWeight: 700 }}>Expected vs scanned</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.45)', color: 'rgba(27,29,33,0.55)' }}>GATI · LIVE</span>
          </div>
          {rows.map((row) => (
            <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 14 }}>
              <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '1px solid ' + row.dotBorder, color: row.dotColor, background: row.dotBg }}>{row.dot}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{row.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.5)' }}>{row.sku}</span>
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 13, color: row.dotColor }}>{row.count}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={scanPackItem} disabled={allScanned} style={{ background: 'rgba(142,14,34,0.07)', border: '1px dashed rgba(142,14,34,0.45)', color: '#8E0E22', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: allScanned ? 0.4 : 1 }}>
              Scan item RFID (demo)
            </button>
            <button onClick={() => set({ packUnknown: true })} style={{ background: 'rgba(229,62,62,0.05)', border: '1px dashed rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Scan wrong item (demo)
            </button>
            {unknown && (
              <button onClick={() => set({ packUnknown: false })} style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.1)', color: '#1B1D21', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Remove unknown — resolve
              </button>
            )}
          </div>
          {allScanned && !unknown && s.packCond !== 'confirmed' && (
            <div style={{ border: '1px solid rgba(217,142,4,0.35)', background: 'rgba(217,142,4,0.06)', borderRadius: 16, padding: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 14, color: '#9A6A00', fontWeight: 700 }}>Condition check</span>
              <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.7)', lineHeight: 1.45, textWrap: 'pretty' }}>
                Show each piece to the camera, capture a close-up still (stone · hallmark · certificate), then confirm. YOLO count: 3 in frame ✓
              </span>
              <button className="hv-brighten" onClick={() => set({ packCond: 'confirmed' })} style={{ background: '#D98E04', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Confirm condition OK
              </button>
            </div>
          )}
        </div>

        <div style={{ borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600, lineHeight: 1.45, border: '1px solid ' + bt.border, background: bt.bg, color: bt.color }}>{banner.msg}</div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button data-tour="packactions" className="hv-red05" onClick={flagPack} style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Flag with evidence
          </button>
          <button className="hv-brighten" onClick={closePack} disabled={!pass} style={{ flex: 1, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: pass ? 1 : 0.4, boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
            Close session
          </button>
        </div>
      </div>
    </div>
  );
}
