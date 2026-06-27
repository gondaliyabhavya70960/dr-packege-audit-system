import { useEffect, useRef, useState } from 'react';
import { MONO, glassPopover } from '../data.js';
import { ChevronDown, Check } from 'lucide-react';

// Custom dropdown matching the app's liquid-glass theme — the native <select>
// menu can't be styled, so this renders a blurred glass popover instead.
// options: [{ value, label }]. Closes on outside-click or Esc.
const triggerStyle = {
  appearance: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: '100%',
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(14px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.6)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: 10,
  padding: '10px 12px 10px 14px',
  fontSize: 13.5,
  fontWeight: 600,
  color: '#1B1D21',
  outline: 'none',
  cursor: 'pointer',
};

export default function GlassSelect({ value, onChange, options, label, minWidth = 150 }) {
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
      {label && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: '#6B7280' }}>{label}</span>}
      <div ref={wrapRef} style={{ position: 'relative', minWidth }}>
        <button type="button" className="fc-accent" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)} style={triggerStyle}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel ? sel.label : ''}</span>
          <ChevronDown size={15} aria-hidden="true" style={{ flex: 'none', color: '#8E0E22', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s ease' }} />
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
                  className="hv-white7"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, textAlign: 'left', border: 'none', background: on ? 'rgba(142,14,34,0.08)' : 'transparent', color: on ? '#8E0E22' : '#1B1D21', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, fontWeight: on ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
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
