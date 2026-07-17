import { Play } from './fa.jsx';
import { MONO, feedBg } from '../data.js';

// The dark evidence-video frame shared by Search & playback and the side-by-side
// review: a striped feed surface with a centered accent play affordance, a
// top-left "streamed from S3" label, and an optional scrub progress bar. Keeping
// both surfaces on this one component guarantees they read identically.
export default function PlaybackFrame({
  label = 'selected record · streamed from S3 via signed URL',
  height = 280,
  radius = 0,
  progress = 0,
  onPlay,
}) {
  return (
    <div style={{ height, borderRadius: radius, position: 'relative', ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <span
        role="button"
        aria-label="Play record"
        onClick={onPlay}
        style={{ width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', background: 'rgba(var(--accent-rgb),0.9)', cursor: onPlay ? 'pointer' : 'default' }}
      >
        <Play size={22} aria-hidden="true" />
      </span>
      <span style={{ position: 'absolute', top: 12, left: 14, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{label}</span>
      {progress ? <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, background: 'var(--accent)', width: progress + '%' }} /> : null}
    </div>
  );
}
