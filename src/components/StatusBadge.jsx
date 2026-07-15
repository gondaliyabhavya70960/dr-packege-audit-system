import { fillTone } from '../data.js';

// The one status badge used everywhere (order list, order header, overview):
// a readable sentence-case pill with a tone dot — no more tiny mono uppercase.
export default function StatusBadge({ status, tone, size }) {
  const f = fillTone(tone);
  const lg = size === 'lg';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: lg ? 13.5 : 12.5,
        fontWeight: 600,
        padding: lg ? '6px 14px' : '4px 12px',
        borderRadius: 999,
        background: f.bg,
        color: f.color,
        border: '1px solid ' + f.border,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 7, height: 7, flex: 'none', borderRadius: '50%', background: f.color }} />
      {status}
    </span>
  );
}
