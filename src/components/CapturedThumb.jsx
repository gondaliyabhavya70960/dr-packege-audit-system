import { Gem } from './line-icons.jsx';
import { feedBg } from '../data.js';

// Mini "captured frame" shown for a product once it's picked up on the scan
// video — a jewelry glyph over a dark camera-feed crop with a green detection
// box. Stands in for the still grabbed when the item is scanned during a
// recording session (the Expected-vs-scanned checklist).
export default function CapturedThumb({ size = 34, label }) {
  const inset = Math.max(5, Math.round(size * 0.16));
  return (
    <span
      role="img"
      aria-label={label || 'Captured product frame'}
      title={label || 'Captured on video'}
      style={{ position: 'relative', width: size, height: size, flex: 'none', borderRadius: 9, overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...feedBg, boxShadow: 'inset 0 0 0 1px rgba(var(--surf-rgb),0.1)' }}
    >
      <Gem size={Math.round(size * 0.46)} aria-hidden="true" style={{ color: 'rgba(255,255,255,0.92)' }} />
      <span style={{ position: 'absolute', inset, border: '1.5px solid #17A35F', borderRadius: 4 }} />
      <span style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#17A35F', boxShadow: '0 0 0 1.5px rgba(0,0,0,0.35)' }} />
    </span>
  );
}
