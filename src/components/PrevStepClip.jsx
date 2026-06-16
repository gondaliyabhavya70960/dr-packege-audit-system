import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { MONO, feedBg } from '../data.js';

// Inline mini player of the order's previously-recorded step (e.g. the
// warehouse pack clip while receiving), so an operator can review it — play +
// scrub — to spot issues against what's arriving. Sits at the bottom of the
// expected-items list; collapsed by default, expands in place.
export default function PrevStepClip({ ctx, id, fallbackLabel = 'Previous step' }) {
  const { s } = ctx;
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(18);
  const iv = useRef();

  useEffect(() => {
    if (!playing) return undefined;
    iv.current = setInterval(() => setT((x) => (x >= 100 ? 0 : x + 2)), 200);
    return () => clearInterval(iv.current);
  }, [playing]);

  const order = s.orders.find((o) => o.id === id);
  const clips = order ? order.timeline.filter((e) => e.clip) : [];
  // most recent filed clip is the previous step; fall back to a generic
  // descriptor so the reference is always available on the receiving bench.
  const prev = clips.length ? clips[clips.length - 1] : { label: fallbackLabel, time: 'on file', who: 'warehouse' };

  if (!open) {
    return (
      <button
        className="prev-clip"
        onClick={() => setOpen(true)}
        title={'Previous step — ' + prev.label + ' · tap to review'}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: 14, padding: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.45)' }}
      >
        <span style={{ position: 'relative', width: 104, height: 62, flex: 'none', borderRadius: 10, overflow: 'hidden', ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ position: 'absolute', top: 4, left: 5, fontFamily: MONO, fontSize: 7.5, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: 4 }}>◦ PREV STEP</span>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(142,14,34,0.92)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={12} aria-hidden="true" /></span>
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Previous step · {prev.label}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#5B616B' }}>tap to review the clip — spot any issue</span>
        </div>
        <span style={{ marginLeft: 'auto', flex: 'none', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(142,14,34,0.08)', color: '#8E0E22', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, fontWeight: 700 }}>Review ▸</span>
      </button>
    );
  }

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.62)' }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.9)' }}>PREVIOUS STEP · {prev.label.toUpperCase()}</span>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prev.time} · {prev.who}</span>
        <button onClick={() => { setOpen(false); setPlaying(false); }} title="Close" aria-label="Close previous-step clip" style={{ marginLeft: 'auto', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFFFFF', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}><X size={13} aria-hidden="true" /></button>
      </div>
      <div style={{ position: 'relative', minHeight: 168, ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>[ {prev.label} — filed clip · {id} ]</span>
        <span style={{ position: 'absolute', top: 10, right: 12, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>FILED ▸ tamper-evident</span>
        <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, background: '#8E0E22', width: t + '%' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(0,0,0,0.62)' }}>
        <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 999, padding: '6px 15px', cursor: 'pointer' }}>{playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}</button>
        <input type="range" min="0" max="100" value={t} onChange={(e) => setT(Number(e.target.value))} style={{ flex: 1, accentColor: '#8E0E22', cursor: 'pointer' }} />
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>compare to spot issues</span>
      </div>
    </div>
  );
}
