import { MONO, feedBg } from '../data.js';

// Real <video> pipeline for filed evidence clips:
//   • poster frame (no blank box) • MP4 (H.264) + WebM (VP9) sources
//   • muted + playsInline + preload="none" (lazy — nothing fetched until play)
//   • accessible label
// Falls back to the styled placeholder when no source is configured, so the
// demo stays clean. Drop clips into /public/assets/clips/<id>.{mp4,webm}
// (and an optional <id>.jpg poster) and pass `src` to activate playback.
export default function ClipPlayer({ src, poster, label, t = 0, height = 230, radius = 18 }) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={label || 'Filed clip'}
        style={{ height, borderRadius: radius, position: 'relative', ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label || '[ clip ]'}</span>
        {t ? <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, background: '#8E0E22', width: t + '%' }} /> : null}
      </div>
    );
  }

  const base = src.replace(/\.(mp4|webm)$/i, '');
  return (
    <video
      controls
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-label={label || 'Filed clip'}
      style={{ height, width: '100%', objectFit: 'cover', borderRadius: radius, background: '#121217', display: 'block' }}
    >
      <source src={base + '.webm'} type="video/webm" />
      <source src={base + '.mp4'} type="video/mp4" />
    </video>
  );
}
