import { useEffect, useRef, useState } from 'react';
import { MONO, glassPopover } from '../data.js';
import { ChevronDown, Check } from './line-icons.jsx';

// Custom dropdown — the native <select> menu can't be styled. The trigger is a
// solid white control matching the app's inputs; the floating menu is a blurred
// glass popover like every other floating surface. An optional leading `Icon`
// (e.g. a calendar on date filters) sits before the value.
// options: [{ value, label }]. Closes on outside-click or Esc.
const triggerStyle = {
  appearance: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid #D6DAE1',
  borderRadius: 12,
  padding: '12px 13px 12px 15px',
  fontSize: 14.5,
  fontWeight: 600,
  color: 'var(--ink-2)',
  outline: 'none',
  cursor: 'pointer',
};

export default function GlassSelect({ value, onChange, options, label, minWidth = 150, Icon }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const sel = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink)' }}>{label}</span>}
      <div ref={wrapRef} style={{ position: 'relative', minWidth }}>
        <button type="button" className="fc-accent" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)} style={triggerStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {Icon && <Icon size={17} aria-hidden="true" style={{ flex: 'none', color: 'var(--ink-2)' }} />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel ? sel.label : ''}</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" style={{ flex: 'none', color: 'var(--mute-2)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s ease' }} />
        </button>
        {open && (
          <div
            role="listbox"
            style={{ ...glassPopover, position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%', width: 'max-content', maxWidth: 300, borderRadius: 14, padding: 6, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 80, maxHeight: 300, overflowY: 'auto' }}
          >
            {options.map((o) => {
              const on = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className="hv-ink04"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, textAlign: 'left', border: 'none', background: on ? 'rgba(var(--accent-rgb),0.08)' : 'transparent', color: on ? 'var(--accent)' : 'var(--ink-2)', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, fontWeight: on ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {o.label}
                  {on && <Check size={14} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </label>
  );
}
