import { Play, Square } from './line-icons.jsx';

// Shared Start / Stop recording toggle. Red "Stop" while live, accent "Start"
// when idle. Used on every live camera-feed card (Pack / Receive / Return) and
// the reusable VideoCaptureCard so the recording control reads the same way
// everywhere.
export default function RecordButton({ recording, onToggle, label, size = 'md', style }) {
  const txt = label || (recording ? 'Stop recording' : 'Start recording');
  const small = size === 'sm';
  return (
    <button
      onClick={onToggle}
      aria-label={txt}
      aria-pressed={recording}
      className="hv-brighten"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: recording ? '#C62B22' : 'var(--accent)',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 10,
        padding: small ? '8px 14px' : '10px 18px',
        fontSize: small ? 13 : 14,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: recording ? '0 4px 14px rgba(198,43,34,0.28)' : '0 4px 14px rgba(var(--accent-rgb),0.25)',
        ...style,
      }}
    >
      {recording ? <Square size={small ? 13 : 15} fill="#FFFFFF" aria-hidden="true" /> : <Play size={small ? 13 : 15} aria-hidden="true" />}
      {txt}
    </button>
  );
}
