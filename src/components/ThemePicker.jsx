import { THEMES } from '../data.js';

// little preview swatch per theme (page backdrop at a glance)
const SWATCH = {
  glass: 'linear-gradient(135deg, #f4eef1, #e9eaf3)',
  paper: '#f3f5f8',
  midnight: 'linear-gradient(135deg, #14161c, #2b313b)',
  devias: 'linear-gradient(135deg, #f4f6f9, #635bff)',
  'devias-pro': 'linear-gradient(135deg, #111927 60%, #635bff)',
  materialize: 'linear-gradient(135deg, #f5f4f9, #7367f0)',
};

// segmented control for the design variation. Renders correctly on every theme
// because it uses the same CSS variables.
export default function ThemePicker({ value, onPick, compact }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {THEMES.map((t) => {
        const on = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onPick(t.key)}
            title={t.label + ' · ' + t.sub}
            aria-pressed={on}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'flex-start',
              flex: compact ? '0 0 auto' : 1,
              border: '1px solid ' + (on ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.15)'),
              background: on ? 'rgba(var(--accent-rgb),0.08)' : 'rgba(var(--surf-rgb),0.5)',
              color: on ? 'var(--accent)' : 'var(--ink-2)',
              borderRadius: 10,
              padding: compact ? '7px 11px' : '9px 12px',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700 }}>
              <span style={{ width: 13, height: 13, flex: 'none', borderRadius: 4, border: '1px solid rgba(var(--ink-rgb),0.2)', background: SWATCH[t.key] }} />
              {t.label}
            </span>
            {!compact && <span style={{ fontSize: 10.5, color: 'var(--mute)' }}>{t.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
