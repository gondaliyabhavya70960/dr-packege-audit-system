import { useEffect, useRef, useState } from 'react';
import { Camera } from './fa.jsx';
import { MONO, feedBg, fmt, nowStamp } from '../data.js';
import RecordButton from './RecordButton.jsx';

// Ephemeral, client-only counter that gives each filed take a stable short hash.
// Only ever touched inside event handlers, so it never runs during SSR/seed
// (keeps the deterministic-render rule intact).
let CAP_SEQ = 0;

// A self-contained video recording card: a live camera-feed surface with a
// Start / Stop recording toggle, a running timer and still-capture. Pressing
// Stop finalises the take and hands a clip record back via `onCapture`
// ({ label, dur, stills, time, hash }) — used to build the captured-clips list.
export default function VideoCaptureCard({
  id = 'NEW',
  label = 'Pack capture',
  camLabel = 'CAM-01 · top view',
  feedText = '[ live feed — pack bench ]',
  onCapture,
  minHeight = 200,
}) {
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [stills, setStills] = useState(0);
  const iv = useRef();

  useEffect(() => {
    if (!recording) return undefined;
    iv.current = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(iv.current);
  }, [recording]);

  const finalise = () => {
    const dur = secs;
    const shots = stills;
    setRecording(false);
    setSecs(0);
    setStills(0);
    if ((dur >= 1 || shots > 0) && onCapture) {
      const seq = (CAP_SEQ += 1);
      const base = String(id || 'cap').replace(/[^a-z0-9]/gi, '').toLowerCase().padEnd(4, '0');
      const hash = base.slice(0, 4) + '…' + ((seq * 2654435761) >>> 0).toString(16).slice(0, 4);
      onCapture({ label, dur, stills: shots, time: nowStamp(), hash });
    }
  };

  const toggle = () => (recording ? finalise() : setRecording(true));

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #ECEDF0', background: 'var(--surface)', boxShadow: '0 1px 2px rgba(15,17,21,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: '1px solid #F0F1F3' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: recording ? '#E53E3E' : '#9AA0A6', animation: recording ? 'pulse 1.4s ease-in-out infinite' : 'none' }} />
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: recording ? '#C62B22' : 'var(--mute)' }}>{recording ? 'REC' : 'READY'}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: 'var(--ink-2)' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 16, color: 'var(--ink-2)' }}>{fmt(secs)}</span>
      </div>
      <div
        role="img"
        aria-label={recording ? 'Live recording camera feed' : 'Camera feed on standby'}
        style={{ position: 'relative', minHeight, ...feedBg, animation: recording ? 'feedDrift 6s linear infinite' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{recording ? feedText : '[ camera ready — press start ]'}</span>
        <span style={{ position: 'absolute', top: 10, left: 12, fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '4px 9px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.75)' }}>{camLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', flexWrap: 'wrap' }}>
        <RecordButton recording={recording} onToggle={toggle} />
        <button
          className="hv-border-accent"
          onClick={() => setStills((x) => x + 1)}
          disabled={!recording}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(var(--surf-rgb),0.6)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--ink-2)', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: recording ? 'pointer' : 'not-allowed', opacity: recording ? 1 : 0.45 }}
        >
          <Camera size={16} strokeWidth={2} aria-hidden="true" /> Capture still
        </button>
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--mute-2)' }}>stills: {stills}</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{recording ? 'chunks hashed at capture · uploading' : 'stop to file the clip'}</span>
      </div>
    </div>
  );
}
