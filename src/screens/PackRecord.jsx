import { useState, useRef, useEffect } from 'react';
import { Camera, Flag, Check, Gem, Pause, RotateCcw, TriangleAlert, Play, Plus, ScanLine } from '../components/fa.jsx';
import { MONO, glass, glassSheet, feedBg, bannerTones, fmt, withOrderFlags } from '../data.js';
import RemarkBox from '../components/RemarkBox.jsx';
import RecordButton from '../components/RecordButton.jsx';
import FlagRemarksModal from '../components/FlagRemarksModal.jsx';
import useDialog from '../components/useDialog.js';

// "Items don't match the order" — shown when the session is saved with items
// still unscanned. One comment, then save-anyway flags the stage for the manager.
function MismatchModal({ missing, unknown, onKeepRecording, onSaveFlag }) {
  const [issue, setIssue] = useState('');
  const dialogRef = useDialog(onKeepRecording);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(22,16,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mismatch-title" tabIndex={-1} style={{ ...glassSheet, borderRadius: 24, width: 540, maxWidth: '100%', maxHeight: '88vh', overflow: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14, outline: 'none' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ width: 42, height: 42, flex: 'none', borderRadius: '50%', background: 'rgba(229,62,62,0.1)', color: '#C62B22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TriangleAlert size={20} aria-hidden="true" />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span id="mismatch-title" style={{ fontSize: 18, fontWeight: 700 }}>Items don't match the order</span>
            <span style={{ fontSize: 13.5, color: 'var(--mute-2)', lineHeight: 1.45 }}>
              Recording is paused. Keep recording to finish scanning — or save anyway with a comment, and this stage is flagged for the manager.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>Missing / not scanned</span>
          {missing.map((m) => (
            <div key={m.sku} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(217,142,4,0.06)', border: '1px solid rgba(217,142,4,0.25)', borderRadius: 10, padding: '9px 13px' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{m.sku}</span>
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, color: '#C62B22' }}>{m.got}/{m.need}</span>
            </div>
          ))}
          {unknown && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(229,62,62,0.06)', border: '1px solid rgba(229,62,62,0.3)', borderRadius: 10, padding: '9px 13px' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Unknown item on the bench</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>RFID-9920 · not on this order</span>
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 12, color: '#C62B22' }}>extra</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>What's the issue?</span>
          <textarea
            className="fc-accent"
            rows={3}
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            aria-label="What's the issue?"
            placeholder="e.g. 1 pendant missing from the pack, stone chipped on the ring"
            style={{ resize: 'vertical', background: 'var(--surface)', border: '1px solid rgba(110,100,108,0.3)', borderRadius: 12, padding: '11px 13px', fontSize: 13.5, color: 'var(--ink-2)', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="hv-white75" onClick={onKeepRecording} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            <Play size={14} aria-hidden="true" /> Keep recording
          </button>
          <button className="hv-brighten" onClick={() => onSaveFlag(issue.trim())} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#C62B22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(198,43,34,0.3)' }}>
            <Flag size={14} aria-hidden="true" /> Save & flag for manager
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PackRecord({ ctx }) {
  const { s, set, showToast, logOrderEvent } = ctx;
  const rec = s.recActive;
  const toggleRec = () => set({ recActive: !s.recActive });
  // which save action is waiting on flagged-product remarks: 'close' | 'flag' | null
  const [remarksFor, setRemarksFor] = useState(null);
  const [mismatchOpen, setMismatchOpen] = useState(false);
  const [manualSku, setManualSku] = useState('');
  // brief "item detected" flash on the feed after each tick
  const [flash, setFlash] = useState(false);
  const flashT = useRef();
  useEffect(() => () => clearTimeout(flashT.current), []);

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
  if (unknown) banner = { msg: '⚠ Unknown item on the bench — remove it, or close to save & flag for the manager.', tone: 'red' };
  else if (!allScanned) banner = { msg: '⚠ ' + missing + ' item' + (missing === 1 ? '' : 's') + ' not yet scanned — keep scanning, or close to save & flag for the manager.', tone: 'red' };
  else if (!condOk) banner = { msg: 'Items match — verify condition to unlock Close. Show each piece to the camera.', tone: 'amber' };
  else banner = { msg: 'PASS — item, quantity and condition verified. Seal the box and close the session.', tone: 'green' };
  const bt = bannerTones[banner.tone];

  const flaggedItems = items.filter((i) => i.flagged);
  const missingItems = items.filter((i) => i.got < i.need);
  const scannedUnits = items.reduce((n, i) => n + Math.min(i.got, i.need), 0);
  const totalUnits = items.reduce((n, i) => n + i.need, 0);
  // the row the camera is "looking for" next while recording
  const activeSku = rec && !allScanned ? (items.find((i) => i.got < i.need) || {}).sku : null;

  const rows = items.map((i) => {
    const got = i.got >= i.need;
    return { key: i.sku, name: i.name, sku: i.sku, captured: got, flagged: !!i.flagged, flaggable: true, scanning: i.sku === activeSku, count: i.got + '/' + i.need };
  });
  if (unknown) rows.push({ key: 'unknown', name: 'UNKNOWN ITEM', sku: 'RFID-9920 · not on this order', captured: false, flagged: false, flaggable: false, scanning: false, bad: true, count: 'extra !' });

  // tick one specific item (manual chip / sku entry / camera-demo)
  const tickItem = (sku) => {
    const next = items.map((i) => ({ ...i }));
    const hit = next.find((i) => i.sku === sku && i.got < i.need);
    if (!hit) return;
    hit.got += 1;
    set({ packItems: next });
    clearTimeout(flashT.current);
    setFlash(true);
    flashT.current = setTimeout(() => setFlash(false), 1600);
  };

  const addManual = () => {
    const q = manualSku.trim().toLowerCase();
    if (!q) return;
    const open = items.find((i) => i.sku.toLowerCase().includes(q) && i.got < i.need);
    if (open) {
      tickItem(open.sku);
      setManualSku('');
      return;
    }
    if (items.some((i) => i.sku.toLowerCase().includes(q))) showToast('That item is already fully scanned.');
    else showToast('SKU not on this order — use "Scan wrong item" to simulate an unknown tag.');
  };

  // flag / unflag a product mid-scan — scanning continues normally afterwards
  const toggleFlag = (sku) => set({ packItems: items.map((i) => (i.sku === sku ? { ...i, flagged: !i.flagged } : i)) });

  // flagged products become order-level flag entries once their remark is in
  const flagEntries = (remarks) => flaggedItems.map((i) => ({ name: i.name, sku: i.sku, step: 'Packaging', remark: (remarks[i.sku] || '').trim(), time: 'today', who: s.userLabel || 'operator' }));

  const finishClose = (remarks) => {
    const entries = flagEntries(remarks);
    const rec = { id: s.packId, kinds: 'pack', outcome: 'PASS', tone: 'green', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today · ' + fmt(s.recSec) + ' session', hash: 'a1' + Math.random().toString(16).slice(2, 8) + '…e4f2', pair: false };
    const label = 'Packed · Warehouse' + (entries.length ? ' · ' + entries.length + ' flagged' : '');
    set({ ...exitNav, lastSession: s.packId + ' · sealed · PASS', records: [rec, ...s.records], orders: withOrderFlags(logOrderEvent(s.packId, label), s.packId, entries) });
    showToast('Pack video filed under ' + s.packId + ' — dispatch confirmed → Gati' + (entries.length ? ' · ' + entries.length + ' product flag(s) recorded' : ''));
  };

  const finishFlag = (remarks, reason) => {
    const entries = flagEntries(remarks);
    const flag = { id: s.packId, reason: (reason || 'pack mismatch').slice(0, 60), age: 'now', amt: '—' };
    const rec = { id: s.packId, kinds: 'pack', outcome: 'HOLD', tone: 'red', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today', hash: 'b3' + Math.random().toString(16).slice(2, 8) + '…7c01', pair: false };
    set({ ...exitNav, lastSession: s.packId + ' · HOLD · flagged', flags: [flag, ...s.flags], records: [rec, ...s.records], orders: withOrderFlags(logOrderEvent(s.packId, 'Pack flagged · hold'), s.packId, entries) });
    showToast('Session held — flag raised with video evidence. Supervisor notified.');
  };

  // Close with unscanned / unknown items pauses recording and asks: keep
  // recording, or save anyway flagged for the manager. A clean close still
  // requires per-product remarks when products were flagged mid-scan.
  const closePack = () => {
    if (!allScanned || unknown) {
      set({ recActive: false });
      return setMismatchOpen(true);
    }
    if (!condOk) return;
    if (flaggedItems.length) return setRemarksFor('close');
    finishClose({});
  };
  const flagPack = () => {
    if (flaggedItems.length) return setRemarksFor('flag');
    finishFlag({});
  };
  const saveFlagMismatch = (issue) => {
    setMismatchOpen(false);
    // the one comment covers the session flag and any product flags
    const remarks = Object.fromEntries(flaggedItems.map((i) => [i.sku, issue || 'pack mismatch']));
    finishFlag(remarks, issue || (unknown ? 'unknown item on bench' : missing + ' item(s) not scanned'));
  };

  return (
    <div data-screen-label="03 Pack and Record" className="pack-grid">
      {/* live feed */}
      <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: rec ? '#E53E3E' : '#9AA0A6', animation: rec ? 'pulse 1.4s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: rec ? '#C62B22' : 'var(--mute)', letterSpacing: '0.18em' }}>{rec ? 'REC' : 'PAUSED'}</span>
          <span style={{ fontFamily: MONO, fontSize: 14, color: 'var(--ink-2)' }}>Session {s.packId}</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 17, color: 'var(--ink-2)' }}>{fmt(s.recSec)}</span>
        </div>
        <div role="img" aria-label={rec ? 'Live pack-bench camera feed, top view' : 'Pack-bench camera paused'} style={{ flex: 1, margin: 13, borderRadius: 16, position: 'relative', ...feedBg, animation: rec ? 'feedDrift 6s linear infinite' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
          {flash ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 16, fontWeight: 700, color: '#4ADE80' }}>
              <Check size={18} strokeWidth={3} aria-hidden="true" /> Item detected
            </span>
          ) : (
            <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{rec ? '[ live feed — top-view · pack bench ]' : '[ recording paused — press start ]'}</span>
          )}
          {rec && (
            <span style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', padding: '4px 11px', borderRadius: 999, background: 'rgba(229,62,62,0.24)', color: '#FF9B9B' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF6B6B', animation: 'pulse 1.4s ease-in-out infinite' }} />
              REC {fmt(s.recSec)}
            </span>
          )}
          <span style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
            On-device detection
          </span>
          <span style={{ position: 'absolute', bottom: 12, left: 12, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>CAM-01 · 1080p · top view</span>
          <span style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: MONO, fontSize: 12, padding: '4px 11px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)' }}>{scannedUnits} / {totalUnits} detected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 13px 13px', flexWrap: 'wrap' }}>
          <RecordButton recording={rec} onToggle={toggleRec} />
          {rec && (
            <button className="hv-white75" onClick={() => set({ recActive: false })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <Pause size={15} aria-hidden="true" /> Pause
            </button>
          )}
          <button
            className="hv-white75"
            onClick={() => { set({ recSec: 0, recActive: true }); showToast('Re-recording — previous take discarded.'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <RotateCcw size={15} aria-hidden="true" /> Re-record
          </button>
          <button className="hv-border-accent" onClick={() => set({ packStills: s.packStills + 1 })} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Camera size={16} strokeWidth={2} aria-hidden="true" /> Take photo
          </button>
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--mute-2)' }}>stills: {s.packStills}</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{rec ? 'chunks hashed at capture · uploading' : 'paused — timer held'}</span>
        </div>
      </div>

      {/* checklist + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ ...glass, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span data-tour="packlist" style={{ fontSize: 17, fontWeight: 700 }}>Expected vs scanned</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--surf-rgb),0.45)', color: 'var(--mute-2)' }}>GATI · LIVE</span>
          </div>
          {rows.map((row) => (
            <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: row.scanning ? 'rgba(var(--accent-rgb),0.04)' : 'rgba(var(--surf-rgb),0.45)', border: '1px solid ' + (row.flagged ? 'rgba(229,62,62,0.4)' : row.scanning ? 'rgba(var(--accent-rgb),0.45)' : row.bad ? 'rgba(229,62,62,0.35)' : 'rgba(var(--surf-rgb),0.55)'), borderRadius: 14 }}>
              {/* scan state: green check when captured, red ! for the unknown, open circle otherwise */}
              <span style={{ width: 24, height: 24, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: row.captured ? '#17A35F' : 'transparent', color: row.captured ? '#FFFFFF' : row.bad ? '#C62B22' : 'transparent', border: row.captured ? 'none' : '2px solid ' + (row.bad ? 'rgba(229,62,62,0.6)' : 'rgba(var(--ink-rgb),0.25)') }}>
                {row.captured ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : row.bad ? '!' : null}
              </span>
              <span style={{ width: 32, height: 32, flex: 'none', borderRadius: 9, background: 'rgba(217,142,4,0.1)', color: '#B57E0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gem size={15} aria-hidden="true" />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{row.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{row.sku}</span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
                {row.scanning && (
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', padding: '3px 9px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)' }}>SCANNING…</span>
                )}
                <span style={{ fontFamily: MONO, fontSize: 13, color: row.captured ? '#0E8A50' : row.bad ? '#C62B22' : 'var(--mute)' }}>{row.count}</span>
              </div>
              {row.flaggable && (
                <button
                  onClick={() => toggleFlag(row.sku)}
                  title={row.flagged ? 'Remove flag from this product' : 'Flag this product'}
                  aria-pressed={row.flagged}
                  style={{ width: 30, height: 30, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', background: row.flagged ? 'rgba(229,62,62,0.12)' : 'transparent', color: row.flagged ? '#C62B22' : 'var(--mute)', border: '1px solid ' + (row.flagged ? 'rgba(229,62,62,0.45)' : 'rgba(0,0,0,0.08)') }}
                >
                  <Flag size={13} fill={row.flagged ? 'currentColor' : 'none'} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          {flaggedItems.length > 0 && (
            <div style={{ border: '1px solid rgba(229,62,62,0.3)', background: 'rgba(229,62,62,0.05)', borderRadius: 14, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#C62B22' }}>
                <Flag size={13} fill="currentColor" aria-hidden="true" /> Flagged products · {flaggedItems.length}
              </span>
              {flaggedItems.map((i) => (
                <div key={i.sku} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{i.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{i.sku}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10, color: '#C62B22' }}>remark at save</span>
                </div>
              ))}
            </div>
          )}
          {/* add an item manually — chips per remaining unit, or type / scan its tag */}
          <div style={{ border: '1px dashed rgba(var(--accent-rgb),0.35)', background: 'rgba(var(--accent-rgb),0.03)', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
              <Plus size={15} aria-hidden="true" style={{ flex: 'none' }} /> Add an item manually
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--mute-2)', lineHeight: 1.45 }}>
              Items tick off automatically as the camera sees them. Missed one? Tap it below (once per unit) or scan its tag.
            </span>
            {missingItems.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {missingItems.map((i) => (
                  <button key={i.sku} onClick={() => tickItem(i.sku)} className="hv-border-accent" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--accent)', borderRadius: 9, padding: '6px 11px', fontFamily: MONO, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                    <Plus size={11} aria-hidden="true" /> {i.sku} <span style={{ color: 'var(--mute)' }}>{i.got}/{i.need}</span>
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 10, padding: '0 12px' }}>
                <ScanLine size={15} aria-hidden="true" style={{ flex: 'none', color: 'var(--mute)' }} />
                <input
                  className="fc-accent"
                  value={manualSku}
                  onChange={(e) => setManualSku(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addManual(); }}
                  placeholder="SKU 4471"
                  aria-label="Add item by SKU"
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: MONO, fontSize: 13, color: 'var(--ink-2)', padding: '9px 0' }}
                />
              </div>
              <button onClick={addManual} className="hv-brighten" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={14} aria-hidden="true" /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => set({ packUnknown: true })} style={{ background: 'rgba(229,62,62,0.05)', border: '1px dashed rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Scan wrong item (demo)
              </button>
              {unknown && (
                <button onClick={() => set({ packUnknown: false })} style={{ background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--ink-2)', borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                  Remove unknown — resolve
                </button>
              )}
            </div>
          </div>
          {allScanned && !unknown && s.packCond !== 'confirmed' && (
            <div style={{ border: '1px solid rgba(217,142,4,0.35)', background: 'rgba(217,142,4,0.06)', borderRadius: 16, padding: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 14, color: '#9A6A00', fontWeight: 700 }}>Condition check</span>
              <span style={{ fontSize: 14, color: 'rgba(var(--ink-rgb),0.7)', lineHeight: 1.45, textWrap: 'pretty' }}>
                Show each piece to the camera, capture a close-up still (stone · hallmark · certificate), then confirm. YOLO count: 3 in frame.
              </span>
              <button className="hv-brighten" onClick={() => set({ packCond: 'confirmed' })} style={{ background: '#D98E04', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Confirm condition OK
              </button>
            </div>
          )}
        </div>

        <div style={{ borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600, lineHeight: 1.45, border: '1px solid ' + bt.border, background: bt.bg, color: bt.color }}>{banner.msg}</div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button data-tour="packactions" className="hv-red05" onClick={flagPack} style={{ flex: 1, background: 'var(--surface)', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Flag with evidence
          </button>
          <button
            className="hv-brighten"
            onClick={closePack}
            disabled={allScanned && !unknown && !condOk}
            style={{ flex: 1, background: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: allScanned && !unknown && !condOk ? 0.4 : 1, boxShadow: '0 4px 14px rgba(var(--accent-rgb),0.25)' }}
          >
            Close session
          </button>
        </div>

        <RemarkBox ctx={ctx} id={s.packId} />
      </div>

      {mismatchOpen && (
        <MismatchModal
          missing={missingItems}
          unknown={unknown}
          onKeepRecording={() => { setMismatchOpen(false); set({ recActive: true }); }}
          onSaveFlag={saveFlagMismatch}
        />
      )}

      {remarksFor && (
        <FlagRemarksModal
          items={flaggedItems.map((i) => ({ key: i.sku, name: i.name, sku: i.sku }))}
          step="Packaging"
          cta={remarksFor === 'close' ? 'Save & close session' : 'Save & flag session'}
          onCancel={() => setRemarksFor(null)}
          onSave={(remarks) => {
            const act = remarksFor;
            setRemarksFor(null);
            (act === 'close' ? finishClose : finishFlag)(remarks);
          }}
        />
      )}
    </div>
  );
}
