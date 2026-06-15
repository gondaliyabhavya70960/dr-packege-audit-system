import { useEffect, useRef, useState } from 'react';
import { MONO, feedBg } from '../data.js';

// Picture-in-picture mini player of the order's previously-recorded step
// (e.g. the warehouse pack clip while receiving), so an operator can glance at
// it — and enlarge + scrub it — to spot issues against the live feed.
// Collapsed by default; expands over the feed it sits in (parent must be
// position: relative).
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
  // the most recent filed clip is the previous step; fall back to a generic
  // descriptor so the reference is always available on the receiving bench.
  const prev = clips.length ? clips[clips.length - 1] : { label: fallbackLabel, time: 'on file', who: 'warehouse' };

  if (!open) {
    return (
      <button
        className="prev-clip"
        onClick={() => setOpen(true)}
        title={'Previous step — ' + prev.label + ' · tap to review'}
        style={{ position: 'absolute', right: 12, bottom: 12, width: 168, height: 100, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', padding: 0, border: '1.5px solid rgba(255,255,255,0.55)', boxShadow: '0 10px 24px -8px rgba(0,0,0,0.7)', ...feedBg }}
      >
        <span style={{ position: 'absolute', top: 6, left: 7, fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 5 }}>◦ PREV STEP</span>
        <span style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'rgba(142,14,34,0.92)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>▶</span>
        <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.82))', color: '#FFFFFF', fontSize: 9.5, fontWeight: 600, padding: '14px 8px 6px', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prev.label}</span>
      </button>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 10, borderRadius: 14, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.78)', display: 'flex', flexDirection: 'column', ...feedBg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', background: 'rgba(0,0,0,0.5)' }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.88)' }}>PREVIOUS STEP · {prev.label.toUpperCase()}</span>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prev.time} · {prev.who}</span>
        <button onClick={() => { setOpen(false); setPlaying(false); }} title="Close" style={{ marginLeft: 'auto', flex: 'none', background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFFFFF', borderRadius: '50%', width: 24, height: 24, fontSize: 12, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>[ {prev.label} — filed clip · {id} ]</span>
        <span style={{ position: 'absolute', top: 10, right: 12, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>FILED ▸ tamper-evident</span>
        <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, background: '#8E0E22', width: t + '%' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', background: 'rgba(0,0,0,0.5)' }}>
        <button onClick={() => setPlaying((p) => !p)} style={{ flex: 'none', background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 999, padding: '6px 15px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{playing ? '❚❚' : '▶'}</button>
        <input type="range" min="0" max="100" value={t} onChange={(e) => setT(Number(e.target.value))} style={{ flex: 1, accentColor: '#8E0E22', cursor: 'pointer' }} />
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>compare to spot issues</span>
      </div>
    </div>
  );
}
