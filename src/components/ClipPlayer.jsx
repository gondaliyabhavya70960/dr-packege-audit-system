import { useState } from 'react';
import { MONO, feedBg } from '../data.js';

// Evidence tag burned into the clip surface: order/RFID/challan ID + timestamp
// + short hash, so an auditor can always tie what they see to the record.
// (Client-side overlay for the demo; a production pipeline would also burn this
// into the encoded frames server-side for true tamper-evidence.)
function EvidenceTag({ id, ts, hash }) {
  if (!id && !ts && !hash) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 8,
        left: 10,
        right: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: '0.03em',
        color: 'rgba(255,255,255,0.92)',
        background: 'rgba(0,0,0,0.55)',
        padding: '3px 9px',
        borderRadius: 6,
        width: 'fit-content',
        maxWidth: 'calc(100% - 20px)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {id && <span>{id}</span>}
      {ts && <span style={{ opacity: 0.8 }}>· {ts}</span>}
      {hash && <span style={{ color: '#7CE0A8' }}>· sha {hash}</span>}
    </div>
  );
}

function StatusOverlay({ kind }) {
  const danger = kind === 'error';
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,8,14,0.45)' }}>
      <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: danger ? '#FF8B8B' : 'rgba(255,255,255,0.85)' }}>
        {danger ? 'clip unavailable — retry' : 'buffering…'}
      </span>
    </div>
  );
}

// Real <video> pipeline for filed evidence clips:
//   • poster frame • MP4 (H.264) + WebM (VP9) sources
//   • muted + playsInline + preload="none" (lazy) • buffering / error states
//   • burned-in evidence tag (id · timestamp · hash)
// Falls back to the styled placeholder when no source is configured. Drop clips
// into /public/assets/clips/<id>.{mp4,webm} (+ <id>.jpg poster) to activate.
export default function ClipPlayer({ src, poster, label, t = 0, height = 230, radius = 18, id, ts, hash }) {
  const [status, setStatus] = useState('idle'); // idle | waiting | error
  const a11y = [label || 'Filed clip', id, ts].filter(Boolean).join(' · ');

  if (!src) {
    return (
      <div
        role="img"
        aria-label={a11y}
        style={{ height, borderRadius: radius, position: 'relative', ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        <EvidenceTag id={id} ts={ts} hash={hash} />
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label || '[ clip ]'}</span>
        {t ? <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, background: '#8E0E22', width: t + '%' }} /> : null}
      </div>
    );
  }

  const base = src.replace(/\.(mp4|webm)$/i, '');
  return (
    <div style={{ position: 'relative', height, borderRadius: radius, overflow: 'hidden', background: '#121217' }}>
      <video
        controls
        muted
        playsInline
        preload="none"
        poster={poster}
        aria-label={a11y}
        onWaiting={() => setStatus('waiting')}
        onPlaying={() => setStatus('idle')}
        onError={() => setStatus('error')}
        style={{ height: '100%', width: '100%', objectFit: 'cover', display: 'block' }}
      >
        <source src={base + '.webm'} type="video/webm" />
        <source src={base + '.mp4'} type="video/mp4" />
      </video>
      <EvidenceTag id={id} ts={ts} hash={hash} />
      {status !== 'idle' && <StatusOverlay kind={status} />}
    </div>
  );
}
