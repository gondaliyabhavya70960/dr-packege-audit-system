import { Check } from 'lucide-react';

// Brand-accent picker. Ruby (#8e0e22) is the theme default across every theme —
// selecting it clears the override (value ''), so themes fall back to their CSS
// var. Any other preset, or the custom colour well, sets an explicit hex that is
// applied as an inline override on <html> and persisted.
const PRESETS = [
  { name: 'Ruby (default)', hex: '#8e0e22' },
  { name: 'Indigo', hex: '#635bff' },
  { name: 'Violet', hex: '#7367f0' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
];

const DEFAULT_HEX = '#8e0e22';

export default function AccentPicker({ value, onPick, compact }) {
  const current = (value || DEFAULT_HEX).toLowerCase();
  const size = compact ? 22 : 26;

  const dot = (bg, on, extra) => ({
    width: size,
    height: size,
    flex: 'none',
    borderRadius: '50%',
    background: bg,
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: on ? '2px solid var(--ink-2)' : '2px solid rgba(var(--surf-rgb),0.7)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    ...extra,
  });

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {PRESETS.map((p) => {
        const on = current === p.hex;
        return (
          <button
            key={p.hex}
            type="button"
            title={p.name}
            aria-pressed={on}
            onClick={() => onPick(p.hex === DEFAULT_HEX ? '' : p.hex)}
            style={dot(p.hex, on)}
          >
            {on && <Check size={compact ? 12 : 13} color="#fff" strokeWidth={3} aria-hidden="true" />}
          </button>
        );
      })}
      {/* custom colour well — opens the OS colour picker */}
      <label title="Custom color" style={dot('conic-gradient(from 0deg, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)', false, { position: 'relative', overflow: 'hidden' })}>
        <input
          type="color"
          value={value || DEFAULT_HEX}
          onChange={(e) => onPick(e.target.value)}
          aria-label="Custom accent color"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', padding: 0, cursor: 'pointer' }}
        />
      </label>
    </div>
  );
}
